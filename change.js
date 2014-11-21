var global = this

function pathValueSort(a, b) {
    if (a.path.length < b.path.length)
        return -1;
    if (a.path.length > b.path.length)
        return 1;

    var aStr = a.path.toString();
    var bStr = b.path.toString();

    return aStr < bStr ? -1 : (aStr > bStr ? 1 : 0);
}

function PathValue(internal, object, path) {
    this.path = path;
    this.observed = new Array(path.length);

    var self = this;

    this.reset = function() {
        var changed = false;
        walkPathValue(self.path, object, function(value, i) {
            if (i == this.path.length) {
                if (this.value == value)
                    return;

                changed = true;
                this.value = value;
                return;
            }

            var observed = this.observed[i];
            if (value === observed)
                return;

            var prop = this.path[i];

            if (observed !== undefined) {
                internal.unobserveProperty(observed, prop, this);
                this.observed[i] = observed = undefined;
            }

            if (!isObject(value))
                return;

            this.observed[i] = observed = value;
            internal.observeProperty(observed, prop, this);
        }, self);

        return changed;
    };

    this.clear = function() {
        object = undefined;
        self.reset();
    };

    this.reset();
}

function summarizePropertyChanges(changeRecords, added, deleted, valueChanged) {
    for (var i = 0; i < changeRecords.length; i++) {
        var record = changeRecords[i];
        if (record.type != 'new' &&
                record.type != 'updated' &&
                record.type != 'deleted') {
            console.error('Unknown changeRecord type: ' + record.type);
            console.error(record);
            continue;
        }

        if (!(record.name in valueChanged) && record.type != 'new') {
            valueChanged[record.name] = record.oldValue;
        }

        if (record.type == 'updated') {
            continue;
        }

        if (record.type == 'new') {
            if (record.name in deleted) {
                delete deleted[record.name];
            } else {
                added[record.name] = true;
            }
            continue;
        }

        // Deleted
        if (record.name in added) {
            delete added[record.name];
            delete valueChanged[record.name];
        } else {
            deleted[record.name] = true;
        }
    }
}

/**
 * Splice Projection functions:
 *
 * A splice map is a representation of how a previous array of items
 * was transformed into a new array of items. Conceptually it is a list of
 * tuples of
 *
 *   <index, removed, addedCount>
 *
 * which are kept in ascending index order of. The tuple represents that at
 * the |index|, |removed| sequence of items were removed, and counting forward
 * from |index|, |addedCount| items were added.
 */

/**
 * Lacking individual splice mutation information, the minimal set of
 * splices can be synthesized given the previous state and final state of an
 * array. The basic approach is to calculate the edit distance matrix and
 * choose the shortest path through it.
 *
 * Complexity: O(l * p)
 *   l: The length of the current array
 *   p: The length of the old array
 */
function calcSplices(current, currentIndex, currentLength, old) {
    var LEAVE = 0;
    var UPDATE = 1;
    var ADD = 2;
    var DELETE = 3;

    function newSplice(index, removed, addedCount) {
        return {
            index: index,
            removed: Array.prototype.slice.apply(removed),
            addedCount: addedCount
        };
    }

    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    function calcEditDistances(current, currentIndex, currentLength, old) {
        // "Deletion" columns
        var distances = new Array(old.length + 1);

        // "Addition" rows. Initialize null column.
        for (var i = 0; i < distances.length; i++) {
            distances[i] = new Array(currentLength + 1)
            distances[i][0] = i;
        }

        // Initialize null row
        for (var j = 0; j < distances[0].length; j++) {
            distances[0][j] = j;
        }

        for (var i = 1; i < distances.length; i++) {
            for (var j = 1; j < distances[i].length; j++) {
                if (old[i - 1] === current[currentIndex + j - 1])
                    distances[i][j] = distances[i - 1][j - 1];
                else
                    distances[i][j] = Math.min(distances[i - 1][j] + 1, // 1 Edit
                            distances[i][j - 1] + 1, // 1 Edit
                            distances[i - 1][j - 1] + 2); // 2 Edits
            }
        }

        return distances;
    }

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    function operations(distances) {
        var i = distances.length - 1;
        var j = distances[0].length - 1;
        var last = distances[i][j];
        var edits = [];
        while (i > 0 || j > 0) {
            if (i == 0) {
                edits.push(ADD);
                j--;
                continue;
            }
            if (j == 0) {
                edits.push(DELETE);
                i--;
                continue;
            }
            var updateOrNoop = distances[i - 1][j - 1];
            var deletion = distances[i - 1][j];
            var addition = distances[i][j - 1];

            var min = Math.min(updateOrNoop, deletion, addition);
            if (min == updateOrNoop) {
                if (updateOrNoop == last) {
                    edits.push(LEAVE);
                } else {
                    edits.push(UPDATE);
                    last = updateOrNoop;
                }
                i--;
                j--;
            } else if (min == deletion) {
                edits.push(DELETE);
                i--;
                last = deletion;
            } else {
                edits.push(ADD);
                j--;
                last = addition;
            }
        }

        edits.reverse();
        return edits;
    }

    var ops = operations(calcEditDistances(current,
            currentIndex,
            currentLength,
            old));

    var splice = undefined;
    var splices = [];
    var index = 0;
    var oldIndex = 0;
    for (var i = 0; i < ops.length; i++) {
        switch (ops[i]) {
            case LEAVE:
                if (splice) {
                    splices.push(splice);
                    splice = undefined;
                }

                index++;
                oldIndex++;
                break;
            case UPDATE:
                if (!splice)
                    splice = newSplice(currentIndex + index, [], 0);

                splice.addedCount++;
                index++;

                splice.removed.push(old[oldIndex]);
                oldIndex++;
                break;
            case ADD:
                if (!splice)
                    splice = newSplice(currentIndex + index, [], 0);

                splice.addedCount++;
                index++;
                break;
            case DELETE:
                if (!splice)
                    splice = newSplice(currentIndex + index, [], 0);

                splice.removed.push(old[oldIndex]);
                oldIndex++;
                break;
        }
    }

    if (splice) {
        splices.push(splice);
    }

    return splices;
}

function projectArraySplices(valueChanged, array) {
    var oldLength = 'length' in valueChanged ? toNumber(valueChanged.length) : array.length;

    // FIXME: This is weak. If length was extended, synthesize "added properties"
    if (array.length != oldLength) {
        var from = oldLength < array.length ? oldLength : array.length;
        var to = oldLength < array.length ? array.length : oldLength;
        for (var i = from; i < to; i++) {
            var p = String(i);
            if (!(p in valueChanged))
                valueChanged[p] = undefined;
        }
    }

    // FIXME: Shouldn't need this if length shortening mutations delete properties.
    function lessThanMaxLength(i) {
        return i < Math.max(oldLength, array.length);
    }

    function gt(a, b) {
        return a - b;
    }

    var indicesChanged = Object.keys(valueChanged).filter(isIndex).map(toNumber).filter(lessThanMaxLength).sort(gt);
    var splices = [];
    var startIndex;
    var removed;

    for (var i = 0; i < indicesChanged.length; i++) {
        var index = indicesChanged[i];
        if (removed) {
            if (startIndex + removed.length == index) {
                removed.push(valueChanged[index]);
                continue;
            } else {
                var currentLength = Math.min(array.length, startIndex + removed.length) - startIndex;
                if (startIndex + removed.length > oldLength)
                    removed.length = oldLength - startIndex;
                var newSplices = calcSplices(array, startIndex, currentLength, removed);
                splices = splices.concat(newSplices);
                removed = undefined;
            }
        }

        startIndex = index;
        removed = [valueChanged[index]];
    }

    if (removed) {
        var currentLength = Math.min(array.length, startIndex + removed.length) - startIndex;
        if (startIndex + removed.length > oldLength)
            removed.length = oldLength - startIndex;
        var newSplices = calcSplices(array, startIndex, currentLength, removed);
        splices = splices.concat(newSplices);
    }

    return splices;
}

global.ChangeSummary = ChangeSummary;

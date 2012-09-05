$.define("date_format",function(){
    var dateFormat = function() {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, timezoneClip = /[^-+\dA-Z]/g, pad = function(
            val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len)
                val = "0" + val;
            return val;
        };

        // Regexes and supporting functions are cached through closure
        return function(date, mask, utc) {
            var dF = dateFormat;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date))
                throw SyntaxError("invalid date");

            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0
            : date.getTimezoneOffset(), flags = {
                d : d,
                dd : pad(d),
                ddd : dF.i18n.dayNames[D],
                dddd : dF.i18n.dayNames[D + 7],
                m : m + 1,
                mm : pad(m + 1),
                mmm : dF.i18n.monthNames[m],
                mmmm : dF.i18n.monthNames[m + 12],
                yy : String(y).slice(2),
                yyyy : y,
                h : H % 12 || 12,
                hh : pad(H % 12 || 12),
                H : H,
                HH : pad(H),
                M : M,
                MM : pad(M),
                s : s,
                ss : pad(s),
                l : pad(L, 3),
                L : pad(L > 99 ? Math.round(L / 10) : L),
                t : H < 12 ? "a" : "p",
                tt : H < 12 ? "am" : "pm",
                T : H < 12 ? "A" : "P",
                TT : H < 12 ? "AM" : "PM",
                Z : utc ? "UTC" : (String(date).match(timezone) || [ "" ]).pop().replace(timezoneClip, ""),
                o : (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S : [ "th", "st", "nd", "rd" ][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

            return mask.replace(token, function($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    // Some common format strings
    dateFormat.masks = {
        "default" : "ddd mmm dd yyyy HH:MM:ss",
        shortDate : "m/d/yy",
        mediumDate : "mmm d, yyyy",
        longDate : "mmmm d, yyyy",
        fullDate : "dddd, mmmm d, yyyy",
        shortTime : "h:MM TT",
        mediumTime : "h:MM:ss TT",
        longTime : "h:MM:ss TT Z",
        isoDate : "yyyy-mm-dd",
        isoTime : "HH:MM:ss",
        isoDateTime : "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime : "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    dateFormat.i18n = {
        dayNames : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
        monthNames : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
    };

    // For convenience...
    Date.prototype.format = function(mask, utc) {
        return dateFormat(this, mask, utc);
    };
    return dateFormat

})
/*

var org;
if (!org) {
    org = {};
}else if (typeof org != "object") {
    throw new Error("Namespace org failed to initialize, org already exists and is not an object!");
}
if (!org.qrh) {
    org.qrh = {};
}else if (typeof org.qrh != "object") {
    throw new Error("Namespace org.qrh failed to initialize, org.qrh already exists and is not an object!");
}
if (!org.qrh.text) {
    org.qrh.text = {};
}else if (typeof org.qrh.text != "object") {
    throw new Error("Namespace org.qrh.text failed to initialize, org.qrh.text already exists and is not an object!");
}

org.qrh.text.SimpleDateFormat = function(options){
    this.pattern = options.pattern;
};
/**
 * Formats a Date into a date/time string.
 * @param date the time value to be formatted into a time string.
 * @return the formatted time string.
 */
org.qrh.text.SimpleDateFormat.prototype.format = function(options){
    var result = this.pattern;
	var date = options.date;
    var year = date.getFullYear().toString();
    result = result.replace(/(yyyy)/g, year);

    var month = (date.getMonth() + 1).toString();
    if (month.length === 1)
        month = "0" + month;
    result = result.replace(/(MM)/g, month);
    result = result.replace(/(M)/g, date.getMonth());

    var day = date.getDate().toString();
    if (day.length === 1)
        day = "0" + day;
    result = result.replace(/(dd)/g, day);
    result = result.replace(/(d)/g, date.getDate());

    var hour = date.getHours().toString();
    if (hour.length === 1)
        hour = "0" + hour;
    result = result.replace(/(hh)/g, hour);
    result = result.replace(/(h)/g, date.getHours());

    var minute = date.getMinutes().toString();
    if (minute.length === 1)
        minute = "0" + minute;
    result = result.replace(/(mm)/g, minute);
    result = result.replace(/(m)/g, date.getMinutes());

    var second = date.getSeconds().toString();
    if (second.length === 1)
        second = "0" + second;
    result = result.replace(/(ss)/g, second);
    result = result.replace(/(s)/g, date.getSeconds());

	var millisecond = date.getMilliseconds().toString();
    if (millisecond.length === 1)
        millisecond = "00" + millisecond;
	if (millisecond.length === 2)
        millisecond = "0" + millisecond;
    result = result.replace(/(SSS)/g, millisecond);
    result = result.replace(/(S)/g, date.getMilliseconds());
    return result;
};
/**
 * Parses text from the given string to produce a date.
 *
 * @param source A String whose should be parsed.
 * @return A Date parsed from the string.
 * @error Parse Exception if the beginning of the specified string cannot be parsed.
 */
org.qrh.text.SimpleDateFormat.prototype.parse = function(options){
	var result = new Date(0);
    var source = options.source;
    var pattern = this.pattern;
    var startIndex = -1;

    startIndex = pattern.indexOf("yyyy");
    if (startIndex >= 0) {
        var year = source.substring(startIndex, startIndex + 4);
		result.setFullYear(year);
		if(result.getFullYear() != year){
			throw new Error("SimpleDateFormat parse " + options.source + " error!");
		}
		pattern.replace(/(yyyy)/g, year);
    }
	startIndex = pattern.indexOf("MM");
    if (startIndex >= 0) {
        var month = source.substring(startIndex, startIndex + 2) - 1;
		pattern.replace(/(MM)/g, month);
		result.setMonth(month);
		if(result.getMonth() != month){
			throw new Error("SimpleDateFormat parse " + options.source + " error!");
		}
    }
	startIndex = pattern.indexOf("dd");
    if (startIndex >= 0) {
        var day = source.substring(startIndex, startIndex + 2);
		pattern.replace(/(dd)/g, day);
		result.setDate(day);
		if(result.getDate() != day){
			throw new Error("SimpleDateFormat parse " + options.source + " error!");
		}
    }
	startIndex = pattern.indexOf("hh");
    if (startIndex >= 0) {
        var hour = source.substring(startIndex, startIndex + 2);
		pattern.replace(/(hh)/g, hour);
		result.setHours(hour);
		if(result.getHours() != hour){
			throw new Error("SimpleDateFormat parse " + options.source + " error!");
		}
    }

	startIndex = pattern.indexOf("mm");
    if (startIndex >= 0) {
        var minute = source.substring(startIndex, startIndex + 2);
		pattern.replace(/(mm)/g, minute);
		result.setMinutes(minute);
		if(result.getMinutes() != minute){
			throw new Error("SimpleDateFormat parse " + options.source + " error!");
		}
    }

	startIndex = pattern.indexOf("ss");
    if (startIndex >= 0) {
        var second = source.substring(startIndex, startIndex + 2);
		pattern.replace(/(ss)/g, second);
		result.setSeconds(second);
		if(result.getSeconds() != second){
			throw new Error("SimpleDateFormat parse " + options.source + " error!");
		}
    }

	startIndex = pattern.indexOf("SSS");
    if (startIndex >= 0) {
        var millisecond = source.substring(startIndex, startIndex + 3);
		pattern.replace(/(SSS)/g, millisecond);
		result.setMilliseconds(millisecond);
		if(result.getMilliseconds() != millisecond){
			throw new Error("SimpleDateFormat parse " + options.source + " error!");
		}
    }
	return result;
};

 */
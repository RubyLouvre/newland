define("tidy_date", function(){
    return {
        //http://ejohn.org/blog/javascript-pretty-date/
        prettify : function (d) {
            if (typeof d === 'string') {
                d = new Date(d);
            }
            var now = new Date(),
            yyyy,
            mm,
            dd,
            diff = ((now.getTime() - d.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400);

            if (isNaN(day_diff) || day_diff < 0) {
                return;
            }

            if (day_diff === 0) {
                if (diff < 60)    return "just now";
                if (diff < 120)   return "1 minute ago";
                if (diff < 3600)  return Math.floor( diff / 60 ) + " minutes ago";
                if (diff < 7200)  return "1 hour ago";
                if (diff < 86400) return Math.floor( diff / 3600 ) + " hours ago";
            }
            if (day_diff === 1) return "yesterday";
            if (day_diff < 7)   return day_diff + " days ago";
            if (day_diff < 31)  return Math.ceil( day_diff / 7 ) + " weeks ago";

            yyyy = d.getFullYear();
            mm = d.getMonth() + 1;
            dd = d.getDate();

            return yyyy + '-' + mm + '-' + dd;
        },
        ISODateString : function (d) {
            if (!d) {
                // default to current time
                var d = new Date();
            }
            function pad(n){
                return n < 10 ? '0' + n : n;
            }
            return d.getUTCFullYear() + '-' +
            pad(d.getUTCMonth() + 1) + '-' +
            pad(d.getUTCDate()) + 'T' +
            pad(d.getUTCHours()) + ':' +
            pad(d.getUTCMinutes()) + ':' +
            pad(d.getUTCSeconds()) + 'Z';
        }
    }
})
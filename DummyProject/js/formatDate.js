Date.prototype.format = function (format) {
    var mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var fullMon = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!format) { format = "MM/dd/yyyy"; }
    var regex = new RegExp("DDDD", "g");
    format = format.replace(regex, fullDays[this.getDay()]);
    regex = new RegExp("DDD", "g");
    format = format.replace(regex, days[this.getDay()]);
    regex = new RegExp("dd", "g");
    format = format.replace(regex, this.getDate());
    regex = new RegExp("MMMM", "g");
    format = format.replace(regex, fullMon[this.getMonth()]);
    regex = new RegExp("MMM", "g");
    format = format.replace(regex, mon[this.getMonth()]);
    regex = new RegExp("MM", "g");
    format = format.replace(regex, this.getMonth() + 1);
    regex = new RegExp("yyyy", "g");
    format = format.replace(regex, this.getFullYear());
    regex = new RegExp("yy", "g");
    format = format.replace(regex, this.getFullYear().toString().substr(2, 2));
    regex = new RegExp("mm", "g");
    format = format.replace(regex, this.getMinutes());
    regex = new RegExp("hh", "g");
    format = format.replace(regex, this.getHours());
    regex = new RegExp("ss", "g");
    format = format.replace(regex, this.getSeconds());
    regex = new RegExp("ms", "g");
    format = format.replace(regex, this.getMilliseconds());
    return format;
};
Date.prototype.yyyymmdd = function () {

    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based         
    var dd = this.getDate().toString();

    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};
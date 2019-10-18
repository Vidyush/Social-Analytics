// months array
const months = {
  Jan: "Jan",
  Feb: "Feb",
  Mar: "Mar",
  Apr: "Apr",
  May: "May",
  Jun: "Jun",
  Jul: "Jul",
  Aug: "Aug",
  Sep: "Sep",
  Oct: "Oct",
  Nov: "Nov",
  Dec: "Dec"
};

module.exports.formatDate = d => {
  var parts = d.split(" ");
  return parts[2] + " " + months[parts[1]];
};

(() => {
  // index.ts
  var dropzone = document.getElementById("dropzone");
  dropzone.ondragenter = () => {
    dropzone.classList.add("drop");
  };
  dropzone.ondragleave = () => {
    dropzone.classList.remove("drop");
  };
  dropzone.ondragend = () => {
    dropzone.classList.remove("drop");
  };
  dropzone.ondragover = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };
  dropzone.ondrop = (event) => {
    event.preventDefault();
    dropzone.classList.remove("drop");
    if (event.dataTransfer.items.length != 1) {
      alert("Drop only a single file");
      return;
    }
    const file = event.dataTransfer.items[0].getAsFile();
    render(file);
  };
  var Row = class {
    constructor(project, duration, date) {
      this.project = project;
      this.duration = duration;
      this.date = date;
    }
  };
  async function render(file) {
    const text = await file.text();
    const rows = parse(text);
    document.getElementById("dropzone").setAttribute("hidden", "");
    document.getElementById("statistic").removeAttribute("hidden");
    document.getElementById("avgTime").innerText = durationText(avgTime(rows));
    document.getElementById("totalTime").innerText = durationText(totalTime(rows));
  }
  function totalTime(rows) {
    return rows.map((r) => r.duration).reduce((a, b) => a + b);
  }
  function avgTime(rows) {
    return totalTime(rows) / 7;
  }
  function durationText(seconds) {
    const s = String(Math.floor(seconds % 60)).padStart(2, "0");
    const m = String(Math.floor(seconds / 60) % 60).padStart(2, "0");
    const h = String(Math.floor(seconds / 60 / 60)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  function parse(text) {
    return drop(1, lines(text)).filter(isNotEmpty).map(parseLine);
  }
  function parseLine(text) {
    let name, dateText, durationText2;
    [name, , dateText, , , durationText2] = text.split(",").map(removeQuotes);
    return new Row(name, parseDuration(durationText2), new Date(dateText));
  }
  function parseDuration(text) {
    let hour, minute, second;
    [hour, minute, second] = text.split(":").map(Number);
    return second + minute * 60 + hour * 60 * 60;
  }
  function isNotEmpty(text) {
    return text.trim() != "";
  }
  function lines(text) {
    return text.split(/\r?\n/);
  }
  function removeQuotes(text) {
    if (text[0] == '"')
      text = text.slice(1);
    if (text[text.length - 1] == '"')
      text = text.slice(0, text.length - 1);
    return text;
  }
  function drop(number, list) {
    return list.splice(number);
  }
})();

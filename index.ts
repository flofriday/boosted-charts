/*
React to file beeing hovered
*/
const dropzone = document.getElementById("dropzone");
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

/*
  Data processing
*/
class Row {
  project: string;
  duration: number;
  date: Date;

  constructor(project: string, duration: number, date: Date) {
    this.project = project;
    this.duration = duration;
    this.date = date;
  }
}

async function render(file: File) {
  const text = await file.text();
  const rows = parse(text);
  document.getElementById("dropzone").setAttribute("hidden", "");
  document.getElementById("statistic").removeAttribute("hidden");
  document.getElementById("avgTime").innerText = durationText(avgTime(rows));
  document.getElementById("totalTime").innerText = durationText(
    totalTime(rows)
  );
}

/*
  Analysis
*/
function totalTime(rows: Row[]): number {
  return rows.map((r) => r.duration).reduce((a, b) => a + b);
}

function avgTime(rows: Row[]): number {
  // TODO: We shouldn't asume that it is always the 7 day export.
  return totalTime(rows) / 7;
}

function durationText(seconds: number): string {
  const s = String(Math.floor(seconds % 60)).padStart(2, "0");
  const m = String(Math.floor(seconds / 60) % 60).padStart(2, "0");
  const h = String(Math.floor(seconds / 60 / 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/*
  Parsing
*/

function parse(text: string): Row[] {
  return drop(1, lines(text)).filter(isNotEmpty).map(parseLine);
}

function parseLine(text: string): Row {
  let name: string, dateText: string, durationText: string;
  [name, , dateText, , , durationText] = text.split(",").map(removeQuotes);
  return new Row(name, parseDuration(durationText), new Date(dateText));
}

function parseDuration(text: string): number {
  let hour: number, minute: number, second: number;
  [hour, minute, second] = text.split(":").map(Number);
  return second + minute * 60 + hour * 60 * 60;
}

/* Util functions */
function isNotEmpty(text: string): boolean {
  return text.trim() != "";
}

function lines(text: string): string[] {
  return text.split(/\r?\n/);
}

// Remove leading and trailing quotes
function removeQuotes(text: string): string {
  if (text[0] == '"') text = text.slice(1);
  if (text[text.length - 1] == '"') text = text.slice(0, text.length - 1);

  return text;
}

function drop<T>(number: number, list: T[]): T[] {
  return list.splice(number);
}

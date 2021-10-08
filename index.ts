import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/*
React to file beeing hovered
*/
const dropzone = document.getElementById("dropzone")!;
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
  event.dataTransfer!.dropEffect = "move";
};
dropzone.ondrop = (event) => {
  event.preventDefault();
  dropzone.classList.remove("drop");

  if (event.dataTransfer!.items.length != 1) {
    alert("Drop only a single file");
    return;
  }

  const file = event.dataTransfer!.items[0].getAsFile()!;
  render(file);
};

/*
  Data processing
*/
class Row {
  constructor(
    public project: string,
    public duration: number,
    public date: Date
  ) {}
}

async function render(file: File): Promise<void> {
  const text = await file.text();
  const rows = parse(text);
  console.log(`Parsed ${rows.length} rows!`);
  document.getElementById("dropzone")!.setAttribute("hidden", "");
  document.getElementById("statistic")!.removeAttribute("hidden");
  document.getElementById("avgTime")!.innerText = durationText(avgTime(rows));
  document.getElementById("totalTime")!.innerText = durationText(
    totalTime(rows)
  );
  renderList(accumulateProjects(rows));
}

function renderList(projects: ProjectRow[]) {
  console.log(projects);
  projects.forEach((p) => {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerText = p.project;
    tr.appendChild(td1);
    let td2 = document.createElement("td");
    td2.innerText = durationText(p.duration);
    tr.appendChild(td2);
    document.getElementById("table")!.appendChild(tr);
  });
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

class ProjectRow {
  constructor(public project: string, public duration: number) {}
}

function accumulateProjects(rows: Row[]): ProjectRow[] {
  // TODO: this could be more immutable
  let dict = new Map<string, number>();
  rows.forEach((r) => {
    if (!dict.has(r.project)) {
      dict.set(r.project, r.duration);
      return;
    }
    dict.set(r.project, dict.get(r.project)! + r.duration);
  });

  const res = Array.from(dict).map(
    ([project, duration]) => new ProjectRow(project, duration)
  );

  return res.sort((a, b) => Number(a.duration < b.duration));
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
  const [name, , dateText, , , durationText] = text
    .split(",")
    .map(removeQuotes);
  return new Row(name, parseDuration(durationText), new Date(dateText));
}

function parseDuration(text: string): number {
  const [hour, minute, second] = text.split(":").map(Number);
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

// cSpell:ignore arraybuffer

function addListeners(): void {
    let button = document.getElementById("update_btn");
    button.addEventListener("click", updateFileList);
}

function createViewLink(): HTMLElement {
  let viewLink = document.createElement("a");
  viewLink.href = "#";
  viewLink.innerHTML = "View";
  viewLink.className = "view_link";
  viewLink.addEventListener("click", viewFile);
  return viewLink;
}

function createDeleteLink(): HTMLElement {
  let deleteLink = document.createElement("a");
  deleteLink.href = "#";
  deleteLink.innerHTML = "Delete";
  deleteLink.className = "delete_link";
  deleteLink.addEventListener("click", deleteFile);
  return deleteLink;
}

function createSpan(): HTMLElement {
  let span = document.createElement("span");
  span.innerHTML = "Directory";
  return span;
}

function createDiv(): HTMLElement {
  let div = document.createElement("div");
  div.className = "content";
  div.style.display = "none";
  return div;
}

function updateFileList(): void {
  let request = new XMLHttpRequest();
  request.open("GET", "http://localhost:80/", true);
  function updateStateChange(): void {
    if (request.readyState === 4) {
      if (request.status === 200) {
        let list = document.getElementById("file_list");
        list.innerHTML = "";
        let files = JSON.parse(request.responseText);
        for (let file of files) {
          let item = document.createElement("li");
          item.innerHTML = file.name;
          if (file.isDir === "0") {
            item.appendChild(createViewLink());
          } else {
            item.appendChild(createSpan());
          }
          item.appendChild(createDeleteLink());
          list.appendChild(item);
        }
      }
    }
  }
  request.onreadystatechange = updateStateChange;
  request.send(null);
}

function createImage(raw: string): HTMLImageElement {
  let element = <HTMLImageElement> document.createElement("img");
  let b64 = btoa(raw);
  element.src = "data:image/*;base64," + b64;
  return element;
}

function createParagraph(raw: string): HTMLElement {
  let element = document.createElement("p");
  element.innerHTML = raw;
  return element;
}

function downloadFile(raw: string, text: string): void {
  let fileName = text.substr(text.lastIndexOf("/") + 1);
  let element = document.createElement("a");
  element.href = "data:application/octet-stream," + encodeURI(raw);
  element.target = "_blank";
  element.download = fileName;
  element.click();
}

function viewAction(event: Event): void {
  let element = <HTMLElement> event.target;
  element.removeEventListener("click", viewAction);
  element.addEventListener("click", hideAction);
  element.innerHTML = "Hide";
  let parent = element.parentElement;
  let content = <HTMLElement> parent.getElementsByClassName("content")[0];
  content.style.display = "block";
}

function hideAction(event: Event): void {
  let element = <HTMLElement> event.target;
  element.removeEventListener("click", hideAction);
  element.addEventListener("click", viewAction);
  element.innerHTML = "View";
  let parent = element.parentElement;
  let content = <HTMLElement> parent.getElementsByClassName("content")[0];
  content.style.display = "none";
}

function addViewAction(element: HTMLElement): void {
  element.removeEventListener("click", viewFile);
  element.addEventListener("click", viewAction);
  element.click();
}

function viewFile(event: Event): void {
  let parent = (<HTMLElement> event.target).parentElement;
  let text = parent.firstChild.textContent;
  let request = new XMLHttpRequest();
  request.responseType = "arraybuffer";
  request.open("GET", "http://localhost:80/" + text, true);
  function updateStateChange(): void {
    if (this.readyState === 4) {
      if (this.status === 200) {
        let arr = new Uint8Array(this.response);
        let raw: string = "";
        for (let i = 0, l = arr.length; i < l; ++i) {
          raw += String.fromCharCode(arr[i]);
        }
        let type = this.getResponseHeader("Content-Type");
        if (type.indexOf("image/") !== -1) {
          let div = createDiv();
          div.appendChild(createImage(raw));
          parent.appendChild(div);
          addViewAction(<HTMLElement> parent.getElementsByClassName("view_link")[0]);
        } else if (type.indexOf("text/") !== -1) {
          let div = createDiv();
          div.appendChild(createParagraph(raw));
          parent.appendChild(div);
          addViewAction(<HTMLElement> parent.getElementsByClassName("view_link")[0]);
        } else {
          downloadFile(raw, text);
        }
      }
    }
  }
  request.onreadystatechange = updateStateChange;
  request.send(null);
}

function deleteFile(event: Event): void {
  let parent = (<HTMLElement> event.target).parentElement;
  let text = parent.firstChild.textContent;
  let request = new XMLHttpRequest();
  request.open("DELETE", "http://localhost:80/" + text, true);
  function updateStateChange(): void {
    if (request.readyState === 4) {
      updateFileList();
    }
  }
  request.onreadystatechange = updateStateChange;
  request.send(null);
}

addListeners();

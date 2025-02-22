import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  Output,
  EventEmitter,
} from "@angular/core";

import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

let PDFJS: any;

function isSSR() {
  return typeof window === "undefined";
}

if (!isSSR()) {
  // @ts-ignore
  PDFJS = require("pdfjs-dist/build/pdf");
}

interface IPdfDocumentLoad {
  numPages: number;
}

@Component({
  selector: "app-pdf-viewer",
  templateUrl: "./pdf-viewer.component.html",
  styleUrls: ["./pdf-viewer.component.css"],
})
export class PDFViewerComponent implements OnInit {
  @Input()
  pdfSrc: string;

  @Input()
  pageNumber = 3;

  @Input()
  zoom = 1.0;

  @Input()
  bgColor = "rgba(0,0,0,0)"; // Default background color is white

  @Output()
  PdfDocumentLoad = new EventEmitter<IPdfDocumentLoad>();

  private _pdfDocument: any;

  constructor() {
    if (isSSR()) {
      return;
    }

    const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;
    PDFJS.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  }

  getNumPages() {
    return this._pdfDocument._pdfInfo.numPages;
  }

  afterPageLoad(): IPdfDocumentLoad {
    const obj = {
      numPages: this.getNumPages(),
    };
    return obj;
  }

  async ngOnInit(): Promise<void> {
    try {
      console.log(this.pdfSrc);
      this._pdfDocument = await this.getDocument();
      this.createRenderTask();

      this.PdfDocumentLoad.emit(this.afterPageLoad());
    } catch (error) {
      console.log(error);
    }
  }

  async ngOnChanges(changes) {
    if (!this._pdfDocument) {
      return;
    }

    if (
      changes.pageNumber &&
      !this.isValidPageNumberRequest(changes.pageNumber.currentValue)
    ) {
      return;
    }

    this.createRenderTask();
  }

  async ngOnDestroy() {
    if (this._pdfDocument) {
      this._pdfDocument.destroy();
      this._pdfDocument = null;
    }
  }

  isValidPageNumberRequest(requestedPage) {
    return requestedPage > 0 && requestedPage <= this.getNumPages();
  }

  private async getDocument() {
    const loadingTask = PDFJS.getDocument(this.pdfSrc);
    return loadingTask.promise.then(function (pdfDocument) {
      return new Promise((resolve) => resolve(pdfDocument));
    });
  }

  private async getPage(page): Promise<PDFPageProxy> {
    return await this._pdfDocument.getPage(page);
  }

  private getCanvas(viewport): HTMLCanvasElement {
    const canvas: any = document.getElementById("pdfCanvas");
    canvas.height = viewport.height * 2;
    canvas.width = viewport.width * 2;
    return canvas;
  }

  private async createRenderTask() {
    for (var num = 1; num <= this._pdfDocument._pdfInfo.numPages; num++) {
      const page: any = await this.getPage(num);
      const viewport = page.getViewport({ scale: this.zoom });
      const canvas: HTMLCanvasElement = this.getCanvas(viewport);

      const context: CanvasRenderingContext2D = canvas.getContext("2d");

      const task = page.render({
        canvasContext: context,
        viewport,
        background: this.bgColor,
      });

      return task;
    }
  }
}

import { toParams, toQuery } from "./utils";

class PopupWindow {
  private id: string;
  private url: string;
  private options: Record<string, string | number>;
  private window: Window | null = null;
  private promise: Promise<Record<string, string | number>> | null = null;
  private iId: number | null = null;

  constructor(id: string, url: string, options = {}) {
    this.id = id;
    this.url = url;
    this.options = options;
  }

  open() {
    const { url, id, options } = this;
    this.window = window.open(url, id, toQuery(options, ","));
  }

  close() {
    this.cancel();
    this.window?.close();
  }

  poll() {
    this.promise = new Promise((resolve, reject) => {
      this.iId = window.setInterval(() => {
        try {
          const popup = this.window;

          if (!popup || popup.closed !== false) {
            this.close();

            reject(new Error("The popup was closed"));

            return;
          }

          if (popup.location.href === this.url || popup.location.pathname === "blank") {
            return;
          }

          const params = toParams(popup.location.search.replace(/^\?/, ""));

          resolve(params);

          this.close();
        } catch (error) {
          /*
           * Ignore DOMException: Blocked a frame with origin from accessing a
           * cross-origin frame.
           */
        }
      }, 500);
    });
  }

  cancel() {
    if (this.iId) {
      window.clearInterval(this.iId);
      this.iId = null;
    }
  }

  then(onSuccess: (data: Record<string, string | number>) => void, onFailure: (error: Error) => void) {
    return this.promise?.then(onSuccess, onFailure);
  }

  static open(id: string, url: string, options: Record<string, string | number>) {
    const popup = new this(id, url, options);

    popup.open();
    popup.poll();

    return popup;
  }
}

export default PopupWindow;

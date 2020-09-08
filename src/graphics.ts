import gm from "gm";
import path from "path";
import fs from "fs-extra";
import { WriteImageResponse } from "./types/writeImageResponse";
import { GetOptionResponse } from "./types/GetOptionResponse";

export class Graphics {
  private quality = 0;

  private format = "png";

  private width = 768;

  private height = 512;

  private density = 72;

  private savePath = "./";

  private saveFilename = "untitled";

  private compression = "jpeg";

  private gm = gm;

  public generateValidFilename(suffix?: string | number): string {
    if (!!suffix) {
      return `${this.savePath}/${this.saveFilename}.${suffix}.${this.format}`;
    }

    return `${this.savePath}/${this.saveFilename}.${this.format}`;
  }

  public gmBaseCommand(stream: NodeJS.ReadableStream | Buffer | string, filename: string): gm.State {
    return this.gm(stream, filename)
      .density(this.density, this.density)
      .resize(this.width, this.height, "!")
      .quality(this.quality)
      .compress(this.compression)
  }

  public writeImage(stream: NodeJS.ReadableStream | Buffer | string, page: number): Promise<WriteImageResponse> {
    const output = this.generateValidFilename(page);

    return new Promise((resolve, reject) => {
      this.gmBaseCommand(stream, this.saveFilename)
        .write(output, (error) => {
          if (error) {
            return reject(error);
          }

          return resolve({
            name: path.basename(output),
            size: fs.statSync(output).size / 1000.0,
            path: output,
            page
          });
        });
    });
  }

  public identify(filepath: string, argument?: string): Promise<gm.ImageInfo | string> {
    const image = this.gm(filepath);

    return new Promise((resolve, reject) => {
      if (argument) {
        image.identify(argument, (error, data) => {
          if (error) {
            return reject(error);
          }

          return resolve(data.replace(/^[\w\W]*?1/, "1"));
        });
      } else {
        image.identify((error, data) => {
          if (error) {
            return reject(error);
          }

          return resolve(data);
        })
      }
    });
  }

  public setQuality(quality: number): Graphics {
    this.quality = quality;

    return this;
  }

  public setFormat(format: string): Graphics {
    this.format = format;

    return this;
  }

  public setSize(width: number, height?: number): Graphics {
    this.width = width;
    this.height = height ?? width;

    return this;
  }

  public setDensity(density: number): Graphics {
    this.density = density;

    return this;
  }

  public setSavePath(savePath: string): Graphics {
    this.savePath = savePath;

    return this;
  }

  public setSaveFilename(filename: string): Graphics {
    this.saveFilename = filename;

    return this;
  }

  public setCompression(compression: string): Graphics {
    this.compression = compression;

    return this;
  }

  public setGMClass(gmClass: string | boolean): Graphics {
    if (typeof gmClass === "boolean") {
      this.gm.subClass({ imageMagick: gmClass });

      return this;
    }

    if (gmClass.toLocaleLowerCase() === "imagemagick") {
      this.gm.subClass({ imageMagick: true });

      return this;
    }

    this.gm.subClass({ appPath: gmClass });

    return this;
  }

  public getOptions(): GetOptionResponse {
    return {
      quality:      this.quality,
      format:       this.format,
      width:        this.width,
      height:       this.height,
      density:      this.density,
      savePath:     this.savePath,
      saveFilename: this.saveFilename,
      compression:  this.compression
    };
  }
}

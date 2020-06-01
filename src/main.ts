interface PPolyfill {
  thenCallbackQueue: Array<any>,
  catchCallback: any,
  finallyCallback: any,
}

class PromisePolyfill implements PPolyfill {
  public thenCallbackQueue: Array<any>;

  public catchCallback: any;

  public finallyCallback: any;

  constructor(start: any) {
    this.thenCallbackQueue = [];
    try {
      start(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.catchCallback.call(this, error);
    }
  }

  resolve(result: any) {
    let thenResult: any;
    thenResult = result;
    if (this.thenCallbackQueue) {
      this.thenCallbackQueue.forEach((thenCallback: any) => {
        thenResult = thenCallback(thenResult);
      });
    }
    if (this.finallyCallback) {
      this.finallyCallback();
    }
  }

  reject(error: any) {
    let catchResult;
    if (this.catchCallback) {
      catchResult = this.catchCallback(error);
    }
    if (this.finallyCallback) {
      this.finallyCallback();
    }
  }

  then(callback: any) {
    this.thenCallbackQueue.push(callback);
    return this;
  }

  catch(callback: any) {
    this.catchCallback = callback;
    return this;
  }

  finally(callback: any) {
    this.finallyCallback = callback;
    return this; // 是否返回
  }
}

export default PromisePolyfill;

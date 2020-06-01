interface PPolyfill {
  status: string,
  reason: any,
  result: any,
  thenCallbackQueue: Array<any>,
  catchCallback: any,
  finallyCallback: any,
}

class PromisePolyfill implements PPolyfill {
  public status: string; // PENDING FULFILLED FAILED

  public reason: any; // 拒绝原因

  public result: any; // 结果

  public thenCallbackQueue: Array<any>;

  public catchCallback: any;

  public finallyCallback: any;

  constructor(start: any) {
    this.thenCallbackQueue = [];
    try {
      start(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject.call(this, error);
    }
  }

  isFailed(): boolean {
    return this.status === 'FAILED';
  }

  isFulfilled(): boolean {
    return this.status === 'FULFILLED';
  }

  resolve(result: any) {
    let thenResult: any;
    thenResult = result;
    // if (this.thenCallbackQueue.length <= 0) {
    //   this.result = result; // 缓存结果
    // }
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
    this.status = 'FAILED';
    this.reason = error;
    if (this.catchCallback) {
      this.reason = this.catchCallback(error);
    }
    if (this.finallyCallback) {
      this.finallyCallback();
    }
  }

  then(callback: any) {
    this.thenCallbackQueue.push(callback);
    // 如果已经是完成状态立即执行
    if (this.isFulfilled() === true) {
      this.thenCallbackQueue = [];
      this.thenCallbackQueue.push(callback);
      this.resolve(this.result);
    }
    return this;
  }

  catch(callback: any) {
    this.catchCallback = callback;
    // 如果已经是拒绝状态立即执行
    if (this.isFailed() === true) {
      this.reject(this.reason);
    }
    return this;
  }

  finally(callback: any) {
    this.finallyCallback = callback;
    return this; // 是否返回
  }
}

export default PromisePolyfill;

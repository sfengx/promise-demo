interface PPolyfill {
  status: string,
  value: any,
  thenCallbackQueue: Array<any>,
  catchCallbackQueue: Array<any>,
  finallyCallbackQueue: Array<any>,
}

// TODO 队列
class PromisePolyfill implements PPolyfill {
  public status: string; // pending resolved rejected

  public value: any; // 结果

  public thenCallback: any;

  public thenCallbackQueue: Array<any>;

  public catchCallbackQueue: Array<any>;

  public finallyCallbackQueue: Array<any>;

  public next: any; // 下一个promise

  constructor(start: any) {
    this.status = 'pending';
    this.thenCallbackQueue = [];
    this.catchCallbackQueue = [];
    this.finallyCallbackQueue = [];
    try {
      start(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject.call(this, error);
    }
  }

  resolve(result: any) {
    // 状态只能改变一次
    if (this.status !== 'pending') {
      return;
    }
    this.status = 'resolved';
    this.value = result; // 缓存结果
    this.thenCallbackQueue.forEach((thenCallback: any) => {
      thenCallback(result);
    });
    this.thenCallbackQueue = [];
    this.finallyCallbackQueue.forEach((finallyCallback: any) => {
      finallyCallback();
    });
    this.finallyCallbackQueue = [];
  }

  reject(error: any) {
    // 状态只能改变一次
    if (this.status !== 'pending') {
      return;
    }
    this.status = 'rejected';
    this.value = error;
    if (this.catchCallbackQueue.length > 0) {
      this.catchCallbackQueue.forEach((catchCallback: any) => {
        catchCallback(error);
      });
      // 异常冒泡
    } else if (this.next) {
      this.next.reject(error);
    }
    this.finallyCallbackQueue.forEach((finallyCallback: any) => {
      finallyCallback();
    });
    this.finallyCallbackQueue = [];
  }

  then(onResolved: any, onRejected: any) {
    this.next = new PromisePolyfill(() => {});
    const thenCallback = (result) => {
      let thenResult;
      try {
        thenResult = onResolved(result);
        this.next.resolve(thenResult);
      } catch (error) {
        this.next.reject(error);
      }
    };
    this.thenCallbackQueue.push(thenCallback);
    if (onRejected) {
      this.catch(onRejected);
    }
    // 如果已经是完成状态立即执行
    if (this.status === 'resolved') {
      this.resolve(this.value);
    }
    return this.next;
  }

  catch(onRejected: any) {
    this.next = new PromisePolyfill(() => {});
    const catchCallback = (error) => {
      let catchResult = onRejected(error);
      this.next.resolve(catchResult);
    };
    this.catchCallbackQueue.push(catchCallback);
    // 如果已经是完成状态立即执行
    if (this.status === 'rejected') {
      this.reject(this.value);
    }
    return this.next;
  }

  finally(callback: any) {
    this.next = new PromisePolyfill(() => {});
    this.finallyCallbackQueue.push(callback);
    // 如果已经不是挂起状态立即执行
    if (this.status !== 'pending') {
      callback();
    }
    return this.next;
  }
}

export default PromisePolyfill;

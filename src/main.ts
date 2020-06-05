interface PPolyfill {
  status: string,
  value: any,
  thenCallbackQueue: Array<any>,
  catchCallbackQueue: Array<any>,
  finallyCallbackQueue: Array<any>,
}

class PromisePolyfill implements PPolyfill {
  public status: string; // pending resolved rejected

  public value: any; // 结果

  public thenCallbackQueue: Array<any>;

  public catchCallbackQueue: Array<any>;

  public finallyCallbackQueue: Array<any>;

  public next: any; // 链式promise

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

  // eslint-disable-next-line class-methods-use-this
  queueMicrotask(callback: any) :void {
    setTimeout(() => {
      callback();
    }, 0);
  }

  resolve(result: any): void {
    this.queueMicrotask(() => {
      // 状态只能改变一次
      if (this.status === 'pending') {
        this.status = 'resolved';
        this.value = result; // 缓存结果
      }
      // then
      this.thenCallbackQueue.forEach((thenCallback: any) => {
        thenCallback(result);
      });
      this.thenCallbackQueue = [];
      // finally
      this.finallyCallbackQueue.forEach((finallyCallback: any) => {
        finallyCallback();
      });
      this.finallyCallbackQueue = [];
    });
  }

  reject(error: any): void {
    this.queueMicrotask(() => {
      // 状态只能改变一次
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.value = error;
      }
      // catch
      if (this.catchCallbackQueue.length > 0) {
        this.catchCallbackQueue.forEach((catchCallback: any) => {
          catchCallback(error);
        });
        // 异常冒泡
      } else if (this.next) {
        this.next.reject(error);
      }
      // finally
      this.finallyCallbackQueue.forEach((finallyCallback: any) => {
        finallyCallback();
      });
      this.finallyCallbackQueue = [];
    });
  }

  then(onResolved: any, onRejected: any): PPolyfill {
    this.next = new PromisePolyfill(() => {});
    // 结果链式传递
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

  catch(onRejected: any): PPolyfill {
    this.next = new PromisePolyfill(() => {});
    const catchCallback = (error) => {
      let catchResult;
      try {
        catchResult = onRejected(error);
        this.next.resolve(catchResult);
      } catch (rejectedError) {
        this.next.reject(rejectedError);
      }
    };
    this.catchCallbackQueue.push(catchCallback);
    // 如果已经是完成状态立即执行
    if (this.status === 'rejected') {
      this.reject(this.value);
    }
    return this.next;
  }

  finally(callback: any): PPolyfill {
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

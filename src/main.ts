interface PPolyfill {
  then: (onResolved: any, onRejected: any) => PPolyfill,
  catch: (onRejected: any) => PPolyfill,
  finally: (onFinally: any) => PPolyfill,
}

class PromisePolyfill implements PPolyfill {
  private status: string; // pending resolved rejected

  private value: any; // 结果

  private thenCallbackQueue: Array<any>;

  private catchCallbackQueue: Array<any>;

  private finallyCallbackQueue: Array<any>;

  private next: any; // 链式promise

  constructor(executor: any) {
    this.status = 'pending';
    this.thenCallbackQueue = [];
    this.catchCallbackQueue = [];
    this.finallyCallbackQueue = [];
    try {
      executor(this.$resolve.bind(this), this.$reject.bind(this));
    } catch (error) {
      this.$reject.call(this, error);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private $queueMicrotask(callback: any): void {
    setTimeout(() => {
      callback();
    }, 0);
  }

  private $resolve(value: any): void {
    // 状态只能改变一次
    if (this.status === 'pending') {
      this.status = 'resolved';
      this.value = value; // 缓存结果
    }
    this.$queueMicrotask(() => {
      // then
      this.thenCallbackQueue.forEach((callback: any) => {
        callback(value);
      });
      this.thenCallbackQueue = [];
      // finally
      this.finallyCallbackQueue.forEach((callback: any) => {
        callback();
      });
      this.finallyCallbackQueue = [];
    });
  }

  private $reject(reason: any): void {
    // 状态只能改变一次
    if (this.status === 'pending') {
      this.status = 'rejected';
      this.value = reason;
    }
    this.$queueMicrotask(() => {
      // catch
      if (this.catchCallbackQueue.length > 0) {
        this.catchCallbackQueue.forEach((callback: any) => {
          callback(reason);
        });
        // 异常冒泡
      } else if (this.next) {
        this.next.$reject(reason);
      }
      // finally
      this.finallyCallbackQueue.forEach((callback: any) => {
        callback();
      });
      this.finallyCallbackQueue = [];
    });
  }

  then(onResolved: any, onRejected: any): PPolyfill {
    this.next = new PromisePolyfill(() => { });
    // 结果链式传递
    const callback = (value: any) => {
      let result;
      try {
        result = onResolved(value);
        this.next.$resolve(result);
      } catch (error) {
        this.next.$reject(error);
      }
    };
    this.thenCallbackQueue.push(callback);
    if (onRejected) {
      this.catch(onRejected);
    }
    // 如果已经是完成状态立即执行
    if (this.status === 'resolved') {
      this.$resolve(this.value);
    }
    return this.next;
  }

  catch(onRejected: any): PPolyfill {
    this.next = new PromisePolyfill(() => { });
    const callback = (reason: any) => {
      let result;
      try {
        result = onRejected(reason);
        this.next.$resolve(result);
      } catch (error) {
        this.next.$reject(error);
      }
    };
    this.catchCallbackQueue.push(callback);
    // 如果已经是完成状态立即执行
    if (this.status === 'rejected') {
      this.$reject(this.value);
    }
    return this.next;
  }

  finally(onFinally: any): PPolyfill {
    this.next = new PromisePolyfill(() => { });
    this.finallyCallbackQueue.push(onFinally);
    // 如果已经不是挂起状态立即执行
    if (this.status !== 'pending') {
      this.$queueMicrotask(() => {
        onFinally();
      });
    }
    return this.next;
  }

  static resolve(value: any): PPolyfill {
    return new this((resolve: any, reject: any) => resolve(value));
  }

  static reject(reason: any): PPolyfill {
    return new this((resolve: any, reject: any) => reject(reason));
  }

  // TODO
  // eslint-disable-next-line class-methods-use-this
  static all(promises: Array<PPolyfill>): PPolyfill {
    return new PromisePolyfill(() => { });
  }

  // TODO
  // eslint-disable-next-line class-methods-use-this
  static race(): PPolyfill {
    return new PromisePolyfill(() => { });
  }
}

export default PromisePolyfill;

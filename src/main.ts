interface PPolyfill {
  status: string,
  value: any,
  thenCallback: any,
  catchCallback: any,
  finallyCallback: any,
}

class PromisePolyfill implements PPolyfill {
  public status: string; // pending resolved rejected

  public value: any; // 结果

  public thenCallback: any;

  public catchCallback: any;

  public finallyCallback: any;

  public next: any; // 下一个promise

  constructor(start: any) {
    this.status = 'pending';
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
    if (this.thenCallback) {
      this.thenCallback(result);
    }
    if (this.finallyCallback) {
      this.finallyCallback();
    }
  }

  reject(error: any) {
    // 状态只能改变一次
    if (this.status !== 'pending') {
      return;
    }
    this.status = 'rejected';
    this.value = error;
    if (this.catchCallback) {
      this.catchCallback(error);
      // 异常冒泡
    } else if (this.next) {
      this.next.reject(error);
    }
    if (this.finallyCallback) {
      this.finallyCallback();
    }
  }

  then(onResolved: any, onRejected: any) {
    this.next = new PromisePolyfill(() => {});
    this.thenCallback = (result) => {
      let thenResult;
      try {
        thenResult = onResolved(result);
        this.next.resolve(thenResult);
      } catch (error) {
        this.next.reject(error);
      }
    };
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
    this.catchCallback = (error) => {
      let catchResult = onRejected(error);
      this.next.resolve(catchResult);
    };
    // 如果已经是完成状态立即执行
    if (this.status === 'rejected') {
      this.reject(this.value);
    }
    return this.next;
  }

  finally(callback: any) {
    this.next = new PromisePolyfill(() => {});
    this.finallyCallback = callback;
    // 如果已经不是挂起状态立即执行
    if (this.status !== 'pending') {
      this.finallyCallback();
    }
    return this.next;
  }
}

export default PromisePolyfill;

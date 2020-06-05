import PromisePolyfill from '../debug/bundle';

class Done {
  constructor() {
    this.result = {};
  }
  watch(run) {
    try {
      run();
      this.result.error = 0;
    } catch (error) {
      this.result.error = error;
    }
  }
  wait(time = 30) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.result.error === 0) {
          resolve();
        } else {
          reject(this.result.error);
        }
      }, time)
    });
  }
}

const done = new Done();

afterEach(() => {
  return done.wait();
});

test('test then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 10);
  });
  p.then(data => {
    done.watch(() => expect(data).toBe(1));
  });
});

test('test chained then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 10);
  });
  let count = 0;
  p.then(data => {
    count = count + data;
    expect(data).toBe(1);
    return 2;
  }).then(data => {
    count = count + data;
    expect(data).toBe(2);
  }).then(() => {
    done.watch(() => expect(count).toBe(3));
  });
});

test('test multiple then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 10);
  });
  let count = 0;
  p.then(data => {
    count = count + 1;
    done.watch(expect(data).toBe(1));
  });
  p.then(data => {
    count = count + 2;
    done.watch(() => expect(count).toBe(3));
  });
  p.then(data => {
    count = count + 3;
    done.watch(() => expect(count).toBe(6));
  });
})

test('test finally', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 10);
  });
  p.finally(error => {
    done.watch(() => expect(error).toBe(undefined));
  });
});

test('test multiple finally', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 10);
  });
  let count = 0;
  p.finally(data => {
    count = count + 1;
    done.watch(expect(data).toBe(undefined));
  });
  p.finally(data => {
    count = count + 2;
    done.watch(() => expect(count).toBe(3));
  });
  p.finally(data => {
    count = count + 3;
    done.watch(() => expect(count).toBe(6));
  });
})

test('test catch of reject', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 10);
  });
  p.catch(error => {
    done.watch(() => expect(error).toBe(1));
  });
});

test('test catch of Error', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    throw new Error('12');
  });
  p.catch(error => {
    done.watch(() => expect(error.message).toBe('12'));
  });
});

test('test catch after then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(2);
    }, 10);
  });
  p.then(data => {
    
  }).catch(error => {
    done.watch(() => expect(error).toBe(2));
  });
});

test('test catch after catch', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 10);
  });
  p.catch(error => {
    done.watch(() => expect(error).toBe(2));
    throw 2;
  }).catch(error => {
    done.watch(() => expect(error).toBe(2));
  });
});

test('test change not pending status', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    resolve(1);
    setTimeout(() => {
      reject(2);
    });
  });
  setTimeout(() => {
    done.watch(() => expect(p.status).toBe('resolved'));
  }, 10);
});

test('test chained catch after then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 10);
  });
  p.then(data => {
    done.watch(() => expect(data).toBe(undefined));
  }).catch(error => {
    done.watch(() => expect(error).toBe(1));
    return 2;
  }).then(data => {
    done.watch(() => expect(data).toBe(2));
    throw new Error('3');
  }).catch(error => {
    done.watch(() => expect(error.message).toBe('3'));
  });
});

test('test microtask', () => {
  let count = 0;
  let p = new PromisePolyfill((resolve) => {
    count = count + 1;
    resolve(1);
  });
  p.then(() => {
    count = count + 4;
  });
  p.finally(() => {
    count = count + 5;
  });
  count = count + 2;
  done.watch(() => expect(count).toBe(3));
});
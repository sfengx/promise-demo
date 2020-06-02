import PromisePolyfill from '../debug/bundle';

const sleep = (result = true, time = 300) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (result) {
        resolve();
      } else {
        reject();
      }
    }, time)
  });
}

it('test then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 100);
  });
  p.then(data => {
    expect(data).toBe(1);
  });
  return sleep();
});

it('test chained then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 100);
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
    expect(count).toBe(3);
  });
  return sleep();
});

it('test more then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 100);
  });
  let count = 0;
  p.then(data => {
    console.log('*');
    count = count + 1;
    expect(data).toBe(1);
  });
  p.then(data => {
    console.log('**');
    count = count + 2;
    expect(count).toBe(4);
  });
  return sleep();
})

it('test finally', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 100);
  });
  p.finally(error => {
    expect(error).toBe(undefined);
  });
  return sleep();
});

it('test catch', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 100);
  });
  p.catch(error => {
    expect(error).toBe(1);
  });
  return sleep();
});

it('test catch after then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(2);
    }, 100);
  });
  p.then(data => {
    
  }).catch(error => {
    expect(error).toBe(2);
  });
  return sleep();
});

it('test catch of Error', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    throw new Error('12');
  });
  p.catch(error => {
    expect(error.message).toBe('12');
  });
  return sleep();
});

it('test change not pending status', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    resolve(1);
    setTimeout(() => {
      reject(2);
    });
  });
  setTimeout(() => {
    expect(p.status).toBe('resolved');
  }, 10);
  return sleep();
});

it('test chained catch after then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 100);
  });
  p.then(data => {
    expect(data).toBe(undefined);
  }).catch(error => {
    expect(error).toBe(1);
    return 2;
  }).then(data => {
    expect(data).toBe(2);
    throw new Error('3');
  }).catch(error => {
    expect(error.message).toBe('3');
  });
  return sleep();
})

import PromisePolyfill from '../debug/bundle';

it('test resolve', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 100);
  });
  p.then(data => {
    expect(data).toBe(1);
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
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
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

it('test finally', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 100);
  });
  p.finally(error => {
    expect(error).toBe(undefined);
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
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
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

it('test catch after then', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    setTimeout(() => {
      reject(1);
    }, 100);
  });
  p.then(data => {
    
  }).catch(error => {
    expect(error).toBe(1);
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

it('test catch of Error', () => {
  let p = new PromisePolyfill((resolve, reject) => {
    throw new Error('12');
  });
  p.catch(error => {
    console.log('test catch of Error => catch');
    expect(error.message).toBe('12');
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

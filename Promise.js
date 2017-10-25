function handlerQueue (queue, status, ctx, val) {
		ctx._status = status;

		for(let [,fn] of queue.entries()) {
			fn.call(ctx, val);
		}

	}

class Promise{

	constructor(fn) {

		this._status      = 'PENDING';
		this.value        = null;
		this.resolveQueue = [];
		this.rejectQueue  = [];
		this.catchHandler = null;

		fn(this.resolve.bind(this), this.reject.bind(this));

	}
        // 实现链式调用
	then(resolveFn, rejectFn) {

		const status       = this._status;
		const resolveQueue = this.resolveQueue;
		const rejectQueue  = this.rejectQueue;

		const catchFn =function(e){
			this.catchHandler(e);
		};

		let p = new Promise((resolve, reject) => {

			const handler = val => {
			try{
				const ret = resolveFn(val);
				if (ret && typeof ret['then'] === 'function') {
				   ret.then((value) => {
				   resolve(value);
			    })
			  } else {
				resolve();
			 }
			} catch(e) {
				catchFn.call(p, e);
			}
		   }

		   const rejectHandler = val => {

		   	const ret = rejectFn(val);
		   	reject();

		   }

			if (status == 'PENDING') {
				resolveQueue.push(handler);
				rejectQueue.push(rejectHandler);
			} else if (status === 'FULLFILLED'){
			        handler();
			} else if(status === 'REJECTED') {
				rejectHandler();
			}

		});

		return p;
	}

	catch(catchFn) {
		this.catchHandler = catchFn;
	}

	resolve(val) {
		handlerQueue(this.resolveQueue, 'FULLFILLED', this, val);
	}

	reject(val) {
		handlerQueue(this.rejectQueue, 'REJECTED', this, val)		
	}

	static all(promises) {

		const values = [];
		const g = generator();

		function* generator(){

			for(let i =0, len = promises.length; i < len; i++) {
				yield i;
			}

		}
		g.next();

		return new Promise((resolve, reject) => {
			   for (let [, p] of promises.entries()) {
			       p.then(val => {
				       const status = g.next()
				       values.push(val);
				       if (status.done) {
				       	    resolve(values);
				         }
			      }, val => {
			      	reject(val);
			      });
		        }
		});
	}

	static race(promises) {
		let temp = true;

		return new Promise((resolve, reject) => {
			for(let [, p] of promises.entries()) {
			   p.then((val) => {

			   	   temp && resolve(val);
			   	   temp = false;
			    });
		     }
		})

	}

	static resolve(val) {
		return new Promise((resolve, reject) => {
			resolve(val);
		})
	}

	static reject(val) {
		return new Promise((resolve, reject) => {
			reject(val);
		})
	}
}



// 实例测试

/*const p = new Promise(resolve => {

	setTimeout(() => resolve('hello'), 1000);

});

let next = p.then(val => {
	console.log('---', val);
	return new Promise(resolve => {
		setTimeout(() => resolve('word'), 1000);
	})
}).then(val => console.log('...', val));

console.log(next);*/

/*const p1 = new Promise(resolve => {
	setTimeout(() => resolve('first'), 1000);
});

const p2 = new Promise(resolve => {
	setTimeout(() => resolve('two'), 3000);
});

Promise.race([p1, p2]).then(result => {
	console.log('this is ---');
});*/

/*const p1 = new Promise((resolve, reject) => {
	setTimeout(() => resolve(1), 2000);
})

const p2 = p1.then((val) =>{
   throw new Error('错了');
});
p2.catch((e) => {
   console.warn('error--', e);
})*/

/*const p1 = Promise.resolve('nihao');
p1.then(() => {
	console.log('resoleve.....');
})*/
const p2 = Promise.reject('nihao');
p2.then(() => {
	console.log('resoleve.....');
}, () => {
	console.log('reject...');
})

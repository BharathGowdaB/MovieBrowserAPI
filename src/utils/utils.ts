import axios from "axios";

const utils = {
    getList: async (url: string, curPage: number = 1, curOffset: number = 0, count: number = 20, callback = (x: any) => x) => {
        curPage = Number(curPage);
        curOffset = Number(curOffset);
        count = Number(count);
        const maxPromiseLength = count * 6;

        const results = [];
        const promiseCallback = [];
        const promisePagination = []

        async function awaitCallbackPromise(){
            const callbackResps = await Promise.all(promiseCallback);
            for(let i = 0 ; i < callbackResps.length; i++){
                if(callbackResps[i] && results.length < count){
                    results.push(callbackResps[i]);
                    console.log(promisePagination[i],results.length , count, results.length === count )
                    if(results.length === count){
                        curOffset = promisePagination[i].nextOffset;
                        curPage = promisePagination[i].nextPage;
                        break;
                    }
                }
            }
            promiseCallback.splice(0, promiseCallback.length);
            promisePagination.splice(0, promisePagination.length);
        }

        while(results.length < count) {
            const res = await axios.get(`${url}&page=${curPage}`);
            const items = res.data?.results;
            if(!items?.length){
                break;
            } else {
                while (curOffset < items.length){
                    promiseCallback.push(callback(items[curOffset++]));
                    promisePagination.push({ 
                        nextOffset: curOffset === items.length ? 0 : curOffset,
                        nextPage: curOffset === items.length ? curPage + 1 : curPage
                    })
                }
                
                if(curOffset >= items.length){
                    curOffset = 0;
                    curPage++;
                }

                if(promiseCallback.length > maxPromiseLength){
                    await awaitCallbackPromise();
                }
            }
        }

        if(promiseCallback.length) await awaitCallbackPromise();

       return {
            count: results.length,
            nextPage: curPage,
            nextOffset: curOffset,
            results
        };
    },
}

export default utils;

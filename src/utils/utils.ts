import axios from "axios";

const utils = {
    getList: async (url: string, curPage: number = 1, curOffset: number = 0, count: number = 20, itemCallback = (x: any) => x) => {
        curPage = Number(curPage);
        curOffset = Number(curOffset);
        count = Number(count);

        const results = [];
        const promiseCallback = [];

        async function getData(){
            const getDataPromise = [];
            for(let i = curPage; i < curPage + 4; i++){
                getDataPromise.push(axios.get(`${url}${i}`, { params : { page: i}}))
            }
            const dataRespArray = await Promise.all(getDataPromise);
            const data = [];
            dataRespArray.forEach((res, page) => {
                const items = res.data?.result?.items || res?.data?.results;
                items?.forEach((item, offset) => {
                    if(offset >= curOffset){
                        const nextOffset = offset + 1;
                        data.push({
                            nextOffset: nextOffset === items.length ? 0 : nextOffset,
                            nextPage: nextOffset === items.length ? (curPage + page + 1) : (curPage + page),
                            item
                        })
                    }
                })
                curOffset = 0;
            });

            return data;
        }

        async function awaitCallbackPromise(){
            const callbackResps = await Promise.all(promiseCallback.map(f => f()));
            for(let i = 0 ; i < callbackResps.length; i++){
                if(callbackResps[i] && callbackResps[i].model && results.length < count){
                    results.push(callbackResps[i].model);
                    if(results.length === count){
                        curOffset = callbackResps[i].nextOffset;
                        curPage = callbackResps[i].nextPage;
                        break;
                    }
                }
            }
            promiseCallback.splice(0, promiseCallback.length);
        }

        while(results.length < count) {
            const data = await getData();
            if(!data?.length){
                break;
            } else {
                data.forEach((itemData) => {
                    promiseCallback.push(async () => {
                        const model = await itemCallback(itemData.item)
                        return {
                            ...itemData,
                            model: model
                        }
                    });
                })
                curPage += 4;
    
                await awaitCallbackPromise();
            }
        }

       return {
            count: results.length,
            nextPage: curPage,
            nextOffset: curOffset,
            results
        };
    },
}

export default utils;

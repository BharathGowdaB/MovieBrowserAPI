import axios from "axios";

const utils = {
    getList: async (url: string, curPage: number = 1, curOffset: number = 0, count: number = 25, itemCallback = (x: any) => x) => {
        curPage = Number(curPage);
        curOffset = Number(curOffset);
        count = Number(count);

        const results = [];
        const promiseCallback = [];
        const maxPageTraversal = Math.ceil((count * 3) / 15);

        async function getData(){
            const getDataPromise = [];
            for(let i = curPage; i < curPage + maxPageTraversal ; i++){
                getDataPromise.push(axios.get(`${url}${i}`, { params : { page: i}}))
            }
            const dataRespArray = (await Promise.all(getDataPromise));
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
            for(let i = 0 ; i < promiseCallback.length; i++){
                const response = await promiseCallback[i];
                if(response && response.model && results.length < count){
                    results.push(response.model);
                    if(results.length === count){
                        curOffset = response.nextOffset;
                        curPage = response.nextPage;
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
                    promiseCallback.push((async () => {
                        const model = await itemCallback(itemData.item)
                        return {
                            ...itemData,
                            model: model
                        }
                    })());
                })
                curPage += maxPageTraversal;
            
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

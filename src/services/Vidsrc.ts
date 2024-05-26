import axios from "axios";
import MovieDB from "./MovieDB";
import TvshowDB from "./TvshowDB";
import Certification, { CertificationType } from "./Certification";

const Vidsrc = {
    BASEURL: "https://vidsrc.to/embed/",
    API_BASEURL: "https://vidsrc.to/vapi/",

    checkForMovie: async (id: string) => {
        try {
            await axios.get(Vidsrc.BASEURL + "movie/" + id);
            return true;
        } catch (error){
            return false;
        }
    },

    checkForTvshow: async (id: string, seasonNumber: number = 1, episodeNumber: number = 1) => {
        try {
            await axios.get(Vidsrc.BASEURL + "tv/" + id + "/" + seasonNumber + "/" + episodeNumber);
            return true;
        } catch (error){
            return false;
        }
    },

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
            const res = await axios.get(`${url}${curPage}`);
            const items = res.data?.result?.items;
     
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

    getNewlyAddedMovies: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const certificationOrder = Certification.getCertificationOrder(certification);
        const url = Vidsrc.API_BASEURL + 'movie/add/';

        return await Vidsrc.getList(url, page, offset, count, async (item) => {
            try{
                const movieModel = await MovieDB.getMovieDetails(item.tmdb_id);
                if(certificationOrder <= Certification.getCertificationOrder(movieModel.certification)){
                    movieModel.streamAvailable = true;
                    return movieModel;
                }
            } catch (error){
                console.log(error);
            } 
        });
    },

    getNewlyAddedTvshows: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const certificationOrder = Certification.getCertificationOrder(certification);
        const url = Vidsrc.API_BASEURL + 'tv/add/';

        return await Vidsrc.getList(url, page, offset, count,  async (item) => {
            try{
                const tvshow = await TvshowDB.getTvshowDetails(item?.id);
                if(certificationOrder <= Certification.getCertificationOrder(tvshow.certification)){
                    const [streamFirstEpisode, streamLastEpisode] = await Promise.all([Vidsrc.checkForTvshow(tvshow.id, 1, 1), Vidsrc.checkForTvshow(tvshow.id, tvshow.seasons.length, tvshow.seasons[tvshow.seasons.length - 1].episodeCount - 1)]);
                    tvshow.streamFirstEpisode = streamFirstEpisode;
                    tvshow.streamLastEpisode = streamLastEpisode;
                    return tvshow;
                }
            } catch (error){
                console.log(error);
            } 
        });
    },
}

export default Vidsrc;

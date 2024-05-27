import TvshowDB from '../../services/TvshowDB';
import Vidsrc from '../../services/Vidsrc';

const controller = {
    getTvshowById: async (req, res) => {
        try {
            const { tvshowId } = req.params;
            const response = await TvshowDB.getTvshowById(tvshowId);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },
    
    getPopularTvshow: async (req, res) => {
        try {
            const { page, offset, count, certification = "NR" } = req.query;
            const response = await TvshowDB.getPopularTvshow(certification, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    getUpcomingTvshow: async (req, res) => {
        try {
            const { page, offset, count, certification = "NR" } = req.query;
            const response = await TvshowDB.getUpcomingTvshow(certification, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    getTopRatedTvshow: async (req, res) => {
        try {
            const { page, offset, count, certification = "NR" } = req.query;
            const response = await TvshowDB.getTopRatedTvshow(certification, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    getNewlyAddedTvshow: async (req, res) => {
        try {
            const { page, offset, count } = req.query;
            const response = await Vidsrc.getNewlyAddedTvshows(page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },
    searchTvshow: async (req, res) => {
        try {
            const { query, page, offset, count } = req.query;
            const response = await TvshowDB.searchTvshow(query, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },
}

export { controller };

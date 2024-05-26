import MovieDB from '../../services/MovieDB';
import Vidsrc from '../../services/Vidsrc';

const controller = {
    getMovieById: async (req, res) => {
        try {
            const { movieId } = req.params;
            const response = await MovieDB.getMovieById(movieId);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },
    getPopularMovies: async (req, res) => {
        try {
            const { page, offset, count, certification = "NR" } = req.query;
            const response = await MovieDB.getPopularMovies(certification, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    getUpcomingMovies: async (req, res) => {
        try {
            const { page, offset, count, certification = "NR" } = req.query;
            const response = await MovieDB.getUpcomingMovies(certification, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    getTopRatedMovies: async (req, res) => {
        try {
            const { page, offset, count, certification = "NR" } = req.query;
            const response = await MovieDB.getTopRatedMovies(certification, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    getNewlyAddedMovies: async (req, res) => {
        try {
            const { page, offset, count, certification = "NR" } = req.query;
            const response = await Vidsrc.getNewlyAddedMovies(certification, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },
    searchMovies: async (req, res) => {
        try {
            const { query, page, offset, count, certification = "NR" } = req.query;
            const response = await MovieDB.searchMovie(query, certification, page, offset, count);
            res.send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },
}

export { controller };

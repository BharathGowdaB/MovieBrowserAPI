
const controller = {
    getPopularMovies: async (req, res) => {
        try {
            console.log("popular")
            res.send("popular list");
        } catch (error) {
            console.log(JSON.stringify(error));
            res.status(500).send("Internal Server Error");
        }
    }
}

module.exports = controller;

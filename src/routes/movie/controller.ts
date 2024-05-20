
const controller = {
    getPopularMovies: async (req, res) => {
        try {
            console.log("popular 33")
            res.send("popular list");
        } catch (error) {
            console.log(JSON.stringify(error));
            res.status(500).send("Internal Server Error");
        }
    }
}

export { controller };

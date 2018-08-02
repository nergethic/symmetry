module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var scoreSchema = new Schema(
        {
            username: { type: String, required: true },
            score: { type: Number, required: true },
            //date: { type: Date, required: false },
        });

    var models = {
        Scores: mongoose.model("score", scoreSchema),
    }

    return models;

}
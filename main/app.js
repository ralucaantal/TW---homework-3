const express = require("express");
const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "my.db",
});

let FoodItem = sequelize.define(
  "foodItem",
  {
    name: Sequelize.STRING,
    category: {
      type: Sequelize.STRING,
      validate: {
        len: [3, 10],
      },
      allowNull: false,
    },
    calories: Sequelize.INTEGER,
  },
  {
    timestamps: false,
  }
);

const app = express();
app.use(express.json());

app.get("/create", async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    for (let i = 0; i < 10; i++) {
      let foodItem = new FoodItem({
        name: "name " + i,
        category: ["MEAT", "DAIRY", "VEGETABLE"][Math.floor(Math.random() * 3)],
        calories: 30 + i,
      });
      await foodItem.save();
    }
    res.status(201).json({ message: "created" });
  } catch (err) {
    console.warn(err.stack);
    res.status(500).json({ message: "server error" });
  }
});

app.get("/food-items", async (req, res) => {
  try {
    let foodItems = await FoodItem.findAll();
    res.status(200).json(foodItems);
  } catch (err) {
    console.warn(err.stack);
    res.status(500).json({ message: "server error" });
  }
});

function valid(Model, payload) {
  return Object.entries(Model.tableAttributes).reduce(
    (valid, [name, field]) => {
      if (valid && !field.primaryKey && !payload[name]) {
        valid = false;
      }
      return valid;
    },
    true
  );
}

app.post("/food-items", async (req, res) => {
  try {
    //     const data = await FoodItem.create(req.body);
    //    res.status(201).location(fooditem.id).send();
    let data = req.body;
    if (Object.keys(data).length === 0) {
      res.status(400).json({ message: "body is missing" });
    }
    // else if(!(data.hasOwnProperty('id'))||!(data.hasOwnProperty('name'))||!(data.hasOwnProperty('category'))||!(data.hasOwnProperty('calories')))
    // {
    //     res.status(400).json({ message: "malformed request" });
    // }
    else if (valid(FoodItem, data) === false) {
      res.status(400).json({ message: "malformed request" });
    } else if (data.calories <= 0) {
      res.status(400).json({ message: "calories should be a positive number" });
    } else if (
      data.category != "MEAT" &&
      data.category != "DAIRY" &&
      data.category != "VEGETABLE"
    ) {
      res.status(400).json({ message: "not a valid category" });
    } else {
      // res.app.locals.foodItems.push(req.body);
      // res.status(201).json({ message: "created" });
      let record = await FoodItem.create(req.body);
      res.status(201).json({ message: "created" });
    }
  } catch (err) {
    console.warn(err);
  }
});

module.exports = app;

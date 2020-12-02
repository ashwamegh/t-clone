const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const merge = require("lodash/merge");
const mongoose = require("mongoose");
const { PubSub } = require("apollo-server");
const { createServer } = require("http");
require("dotenv").config();

// const {  } = require('./section/model')

const typeDefs = gql`
	type Section {
		id: ID!
		title: String!
		label: String!
		pos: Int!
		description: String
		cards: [Card]
	}
`;

const resolvers = {};

const MONGO_USER = process.env.MONGO_USER || "root";
const MONGO_PASS = process.env.MONGODB_PASS;
mongoose
	.connect(
		`mongodb://${MONGO_USER}:${MONGO_PASS}@ds231517.mlab.com:31517/trello-hooks-graphql-clone`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		console.log("mongodb connected successfully");
		const server = new ApolloServer({
			typeDefs,
			resolvers,
			context: () => ({
				card: cardModel,
				section: sectionModel
			}),
		});
		const app = express();
		server.applyMiddleware({ app });
		const httpServer = createServer(app);
		server.installSubscriptionHandlers(httpServer);
		const PORT = process.env.PORT || 4444;
		httpServer.listen({ port: PORT }, () => {
			console.log(`Server is running in port ${PORT}`);
		});
	})
	.catch((err) => {
		console.log(err);
	});
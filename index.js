require("dotenv").config();

const { RESTDataSource, RequestOtions } = require("apollo-datasource-rest");
const { ApolloServer, gql } = require("apollo-server");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Order {
    id: String
    email: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    orders: [Order]
  }
`;

// class PersonalizationAPI extends RESTDataSource {
//   willSendRequest(request) {
//     request.headers.set("Authorization", `Basic ${process.env.BASE64_AUTH}`);
//   }
// }

class ShopifyAPI extends RESTDataSource {
  constructor() {
    super();
    const { SHOP_API, SHOP_PASSWORD } = process.env;
    this.baseURL = `https://${SHOP_API}:${SHOP_PASSWORD}@lucky-lovely-shop.myshopify.com/admin/api/2020-01/`;
  }

  async getOrders() {
    return this.get(`orders.json`);
  }
}

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    orders: async (_source, _, { dataSources }) => {
      return dataSources.shopifyAPI.getOrders();
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      shopifyAPI: new ShopifyAPI()
    };
  }
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

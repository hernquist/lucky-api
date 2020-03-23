require("dotenv").config();

const { RESTDataSource, RequestOtions } = require("apollo-datasource-rest");
const { ApolloServer, gql } = require("apollo-server");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type LineItem {
    title: String
    quantity: Int
    id: Int
    variant_id: Int
    sku: String
    variant_title: String
    vendor: String
    fulfillment_service: String
    product_id: Int
    requires_shipping: Boolean
    taxable: Boolean
    gift_card: Boolean
    name: String
    variant_inventory_management: String
    product_exists: Boolean
    fulfillable_quantity: Int
    grams: Int
    price: String
    total_discount: String
    fulfillment_status: String
  }

  type Order {
    id: String
    email: String
    created_at: String
    updated_at: String
    name: String
    total_line_items_price: String
    total_price: String
    line_items: [LineItem]
  }

  type Product {
    id: String
    title: String
    body_html: String
    vendor: String
    product_type: String
    created_at: String
    handle: String
    updated_at: String
    published_at: String
    template_suffix: String
    published_scope: String
    tags: String
    admin_graphql_api_id: String
    # variants: [Array]
    # options: [Array]
    # images: [Array]
    # image: [Object]
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    orders: [Order]
    products: [Product]
  }
`;

class PersonalizationAPI extends RESTDataSource {
  willSendRequest(request) {
    request.headers.set("Authorization", `Basic ${process.env.BASE64_AUTH}`);
  }
}

class ShopifyAPI extends PersonalizationAPI {
  constructor() {
    super();
    const { SHOP_API, SHOP_PASSWORD } = process.env;
    // this.baseURL = `https://${SHOP_API}:${SHOP_PASSWORD}@lucky-lovely-shop.myshopify.com/admin/api/2020-01/`;
    this.baseURL = `https://lucky-lovely-shop.myshopify.com/admin/api/2020-01/`;
  }

  async getOrders() {
    return this.get(`orders.json`);
  }
  async getProducts() {
    return this.get(`products.json`);
  }
}

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    orders: async (_source, _, { dataSources }) => {
      const x = await dataSources.shopifyAPI.getOrders();
      return x.orders;
      // return x.orders.map(a => ({
      //   id: a.id,
      //   email: a.email,
      //   created_at: a.created_at
      // }));
    },
    products: async (_source, _, { dataSources }) => {
      const x = await dataSources.shopifyAPI.getProducts();
      console.log(x);
      return x.products;
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

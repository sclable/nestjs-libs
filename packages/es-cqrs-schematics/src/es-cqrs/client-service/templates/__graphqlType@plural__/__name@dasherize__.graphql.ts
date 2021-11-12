import { Injectable } from '@angular/core'
import { <%= classify(graphqlType) %> } from 'apollo-angular'
import gql from 'graphql-tag'
<% for (let imp of imports) { %>
import { <% for (let i of imp.imports) { %><%= i %>, <% } %>} from '<%= imp.path %>'<% } %>

<% if (graphqlType === 'query') { %>
export interface Response {
  <%= graphqlFunction %>: <%= returnType %>,
}
<% } %>

@Injectable({
  providedIn: 'root',
})
export class <%= classify(name) %>GQL extends <%= classify(graphqlType) %><% if (graphqlType === 'query') { %><Response><% } %> {
  document = gql`
    <%= graphqlType %>(<% for (let param of parameters) { %>$<%= param.name %>: <%= param.type %>,<% } %>) {
      <%= graphqlFunction %>(<% for (let param of parameters) { %><%= param.name %>: $<%= param.name %>,<% } %>)
      <% if (readParameters) { %>{<%= readParameters %>}<% } %>
    }
  `
}

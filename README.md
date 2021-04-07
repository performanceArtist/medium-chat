# Chat

## Running the project

Navigate to client folder, run `npm run dev`. Do the same for the server folder.

Running the server the first time creates sqlite database with the following chat users:

BigChungmire/test
sherk/test

## Architecture

### View

Knows how to display data and how to react to user actions.

### Source

Contains a state of a single "feature" + a set of events, which may change the state. Shouldn't know more than `View` - all the events and data should be bound to `View`. If there is a state change, it should make sense in the context of a feature.

### Container

Maps events and data from `Source` to a view's props. Manages `Source` and `Medium` creation and lifecycle.

### Medium

An entity that uses `Source` and real-world(`Service`) interfaces to produce various effects. An integration layer between `View`'s state/events(`Source`) and `Services`. Implements application logic.

### Service

Provides an interface to a certain real-world functionality domain or business entity. For example, "user" `Service` may provide methods to login, logout and fetch user info. This layer can be split depending on situation.

The separation employed here is between `Client`s and `Stores`. `Client` layer provides generic HTTP and socket clients. `Store` layer uses them to create an interface over a particular domain, as well as to form a cache.

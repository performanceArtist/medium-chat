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

### Service

Provides an interface to a certain real-world functionality domain or business entity. For example, "user" `Service` may provide methods to login, logout and fetch user info. This layer can be split depending on situation.

The separation employed here is between `Client`s and `Stores`. `Client` layer provides generic HTTP and socket clients. `Store` layer uses them to create an interface over a particular domain, as well as to form a cache.

### Medium

An entity that uses `Source` and real-world(`Service`) interfaces to produce various effects. An integration layer between `View`'s state/events(`Source`) and `Services`. Implements application logic.

### Container

Maps events and data from `Source` to a view's props. Manages `Source` and `Medium` creation and lifecycle.

## Plan for a change

Changes in presentation(`View`) are completely separated from business logic. If presentation requires a piece of state, it can be added to `Source` and modified by `View`, by calling `dispatch`. If the need arises to add additional logic to control the state, which depends on something besides user interaction, it should be implemented in `Medium`.

Changes in application logic are working with `Source` and `Service` interfaces. The only changes that may be required are slight event modifications - for example, click event may provide more or less information. Their validity should be verified by testing.

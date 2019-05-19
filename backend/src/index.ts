import * as Koa from "koa";
import * as bodyparser from "koa-bodyparser";
import * as cors from "kcors";

import * as Router from "koa-router";

const elevatorState = {
  floors: [
    {floor: -2, requesting: false},
    {floor: -1, requesting: false},
    {floor: 0, requesting: false},
    {floor: 1, requesting: false},
    {floor: 2, requesting: false},
    {floor: 3, requesting: false},
    {floor: 4, requesting: false},
    {floor: 5, requesting: false},
    {floor: 6, requesting: false},
    {floor: 7, requesting: false},
    {floor: 8, requesting: false},
    {floor: 9, requesting: false},
    {floor: 10, requesting: false},
    {floor: 11, requesting: false},
    {floor: 12, requesting: false},
    {floor: 14, requesting: false},
    {floor: 15, requesting: false},
    {floor: 16, requesting: false},
    {floor: 17, requesting: false},
    {floor: 18, requesting: false},
  ],
  elevators: [
    {no: 5040, idle: true, destination: 2, floor: 2},
    {no: 42, idle: true, destination: 1, floor: 1},
    {no: 3, idle: true, destination: 15, floor: 15},
    {no: 1008, idle: true, destination: 7, floor: 7},
    {no: 9001, idle: true, destination: 8, floor: 8},
  ]
}

const app = new Koa();
app.use(bodyparser({
  enableTypes: ["json"]
}))

const router = new Router();

const retState = ctx =>
  Object.assign(ctx.response, {
    body: elevatorState,
    status: 200,
  });

router.get("/e", ctx => retState(ctx));



const startElevator = (eno, destination) => {
  const elevator = getElevator(eno)

  if(!elevator) return

  // Only start with a valid destination
  if(!elevatorState.floors.find(f => f.floor == destination)) return

  elevator.idle = false
  elevator.destination = destination

  const intervalHandle = setInterval(() => {
    // Move the elevator 1 floor every 2 seconds
    // if it is at its destination, make it idle and clear button
      elevator.floor += elevator.floor > destination ? -1 : 1

    if(elevator.floor == destination) {
      elevator.idle = true
      getFloor(destination).requesting = false

      clearInterval(intervalHandle)

      // If there is a requesting floor that has no elevator going for it
      // start this elevator with that floor as destination
      const closestRequestingFLoor = getClosest(destination,
        elevatorState.floors
        .filter(f => f.requesting)
        .filter(f => !elevatorState.elevators.find(e => e.destination == f.floor)))

      if(closestRequestingFLoor)
        startElevator(eno, closestRequestingFLoor.floor)
    }
  }, 2000)
}

const getElevator = no =>
  elevatorState.elevators.find(e => e.no == no)

const getFloor = floor =>
  elevatorState.floors.find(f => f.floor == floor)

const getClosest = (floor, array) =>
  array.sort((a, b) => Math.abs(a.floor - floor) - Math.abs(b.floor - floor))[0]

const getClosestIdleElevator = floor =>
  getClosest(floor, elevatorState.elevators.filter(e => e.idle))


router.post("/r", ctx => {
  const floor: any = ctx.request.body.floor
  const cf = getFloor(floor)

  if(cf) {
    const ce = getClosestIdleElevator(floor)
    if(ce && ce.idle && ce.floor == floor) return

    if(!cf.requesting) {
      cf.requesting = true

      // If there is a closest idle elevator not on this floor we start it
      if(ce) startElevator(ce.no, floor)

      // Else do nothing, next time an elevator goes idle it will start itself
      // next requested destination
    }
  }

  // TODO send error response to client
  retState(ctx)
});


app.use(cors());

app.use(router.routes());

app.listen(3000);


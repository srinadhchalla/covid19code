const express = require('express')

const app = express()

const {open} = require('sqlite')

const path = require('path')

app.use(express.json())

const dbpath = path.join(__dirname, 'covid19India.db')

const sqlite3 = require('sqlite3')
initilisingSERVERandDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost/3000')
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}
initilisingSERVERandDB()

requireOutput = object => {
  return {
    stateId: object.state_id,
    stateName: object.state_name,
    populatoin: object.population,
  }
}

app.get('/states/', async (request, response) => {
  const dbquery = `SELECT * FROM state order by state_id`

  const dbresponce = await db.all(dbquery)
  response.send(dbresponce.map(object => requireOutput(object)))
})

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  console.log(stateId)
  const dbquery = `SELECT * FROM state WHERE state_id = ${stateId}`

  const dbresponce = await db.get(dbquery)
  response.send({
    stateId: dbresponce.state_id,
    stateName: dbresponce.state_name,
    popualation: dbresponce.population,
  })
})

app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const dbquery = `
  INSERT INTO district(district_name, state_id, cases, cured, active, deaths)
  values (
    "${districtName}",
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
  )
  `
  await db.run(dbquery)
  response.send('District Successfully Added')
})

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params

  const dbquery = `SELECT * FROM district WHERE district_id = ${districtId}`

  const dbresponce = await db.get(dbquery)
  response.send({
    districtId: dbresponce.district_id,
    districtName: dbresponce.district_name,
    stateId: dbresponce.state_id,
    cases: dbresponce.cases,
    cured: dbresponce.cured,
    active: dbresponce.active,
    deaths: dbresponce.deaths,
  })
})

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params

  const dbquery = `
   DELETE FROM district WHERE district_id = ${districtId};
  `
  await db.run(dbquery)
  response.send('District Removed')
})

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const dbquery = `
  UPDATE district
  set 
    district_name = "${districtName}",
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
  
  WHERE 
  district_id = ${districtId};

  `
  await db.run(dbquery)
  response.send('District Details Updated')
})

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  console.log(stateId)
  const dbquery = `
  SELECT 
   SUM(cases)
  FROM 
   district
  WHERE 
   state_id = ${stateId};
  `
  const stats = await db.get(dbquery)
  console.log(stats)
  response.send({
    totalCases: stats['SUM(cases)'],
  })
})

module.exports = app

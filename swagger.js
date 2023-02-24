const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const port = 3002;

const mariadb = require('mariadb');
const pool = mariadb.createPool({
        host : 'localhost',
        user : 'root',
        password: 'root',
        port: 3306,
        connectionLimit:5
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const options = {
    swaggerDefinition :{
        info:{
            title: 'Ravi Yadav',
            version: '1.0.0',
            description: 'ITIS 6177'
        },
        host: '147.182.221.183:3002',
        basePath: '/',
    },
    apis: ['./swagger.js'],
}

const specs = swaggerJsdoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Get all agents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful response with array of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

// Define the GET /agents route
app.get('/agents', (req, res) => {
        // Query the database to get all agents
        pool.query('SELECT * FROM sample.agents')
          .then(result => {
            // If successful, send the array of agents
            res.status(200).json(result.rows);
          })
          .catch(error => {
            // If there was an error, send an error response
            console.error('Error executing query', error.stack);
            res.status(500).send('Error executing query');
          });
      });
      

/**
 * @swagger
 * components:
 *     AgentPut:
 *       type: object
 *       properties:
 *         agentCode:
 *           type: string
 *           description: The code of the agent to update
 *         agentName:
 *           type: string
 *           description: The name of the agent
 *         workingArea:
 *           type: string
 *           description: The working area of the agent
 *         commission:
 *           type: number
 *           description: The commission of the agent
 *         phoneNo:
 *           type: string
 *           description: The phone number of the agent
 *         country:
 *           type: string
 *           description: The country of the agent
 *       required:
 *         - agentCode
 *         - agentName
 *         - workingArea
 *         - commission
 *         - phoneNo
 *         - country
 * /agents:
 *   put:
 *     summary: Update an agent
 *     description: Update an existing agent in the database
 *     tags:
 *       - Agents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 affectedRows:
 *                   type: number
 *       201:
 *         description: Agent not found in table
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: The agent is not located in the table - Operation unsuccessful
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

// Define the PUT /agents route
app.put('/agents', (req, res) => {
        // Update the agent in the database using a SQL query
        pool.query(`UPDATE sample.agents SET agent_name = $1, working_area = $2, commission = $3, phone_no = $4, country = $5 WHERE agent_code = $6`, [
          req.body.agentName,
          req.body.workingArea,
          req.body.commission,
          req.body.phoneNo,
          req.body.country,
          req.body.agentCode
        ])
          .then(result => {
            if (result.rowCount > 0) {
              // If successful, send a JSON response with the affected rows
              res.status(200).json({
                affectedRows: result.rowCount
              });
            } else {
              // If the agent was not found in the table, send a 201 response with a plain text message
              res.status(201).send('The agent is not located in the table - Operation unsuccessful');
            }
          })
          .catch(error => {
            // If there was an error, send an error response
            console.error('Error executing query', error.stack);
            res.status(500).send('Error executing query');
          });
      });
      


/**
 * @swagger
 * /agents:
 *   post:
 *     summary: Updates agents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/AgentPost'
 *     responses:
 *       '200':
 *         description: A good response
 *       '201':
 *         description: No rows added -Operation unsuccessful
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       '404':
 *         description: Error executing query
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *     tags:
 *       - agents
 */


/**
 * @swagger
 * components:
 *     AgentPost:
 *       type: object
 *       properties:
 *         agentCode:
 *           type: string
 *         agentName:
 *           type: string
 *         workingArea:
 *           type: string
 *         commission:
 *           type: string
 *         phone_no:
 *           type: string
 *         country:
 *           type: string
 */

app.post('/agents', (req, resp) => {
        const { agentCode, agentName, workingArea, commission, phone_no, country } = req.body;
        const query = `INSERT INTO sample.agents VALUES ('${agentCode}', '${agentName}', '${workingArea}', '${commission}', '${phone_no}', '${country}')`;
      
        pool.query(query)
          .then((result) => {
            console.log(result);
            if (result.affectedRows > 0) {
              resp.status(200).json(result);
            } else {
              resp.status(201).send('No rows added - Operation unsuccessful');
            }
          })
          .catch((err) => {
            console.error('Error executing query', err.stack);
            resp.status(404).send('Error executing query' + err.stack);
          });
      });
      

/**
 * @swagger
 * /agents:
 *  delete:
 *    description: Removes product
 *    consumes: 
 *    - application/json
 *    produces:
 *    - application/json
 *    parameters:
 *    - in: body
 *      name: name
 *      required: true
 *      schema:
 *        type: string
 *        $ref: "#/definitions/agentDel"
 *    responses: 
 *      200:
 *       description: A good response
*/
app.delete('/agents', (req, resp) => {
        const { agentCode } = req.body;
        const query = `DELETE FROM sample.agents WHERE agent_Code = '${agentCode}'`;
      
        pool.query(query)
          .then((result) => {
            console.log(result);
            if (result.affectedRows > 0) {
              resp.status(200).json(result);
            } else {
              resp.status(201).send('No rows delete - operation unsuccessful');
            }
          })
          .catch((err) => {
            console.error('Error executing query', err.stack);
            resp.status(404).send('Error executing query' + err.stack);
          });
      });

/**
 * @swagger
 * /agents:
 *   delete:
 *     summary: Removes product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/AgentDel'
 *     responses:
 *       '200':
 *         description: A good response
 *       '201':
 *         description: No rows delete - operation unsuccessful
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       '404':
 *         description: Error executing query
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *     tags:
 *       - agents
 */


app.patch('/agents', async (req, resp) => {
        try {
            const result = await pool.query(`update sample.agents set agent_name = '${req['body'].agentName}',  working_area = '${req['body'].workingArea}', commission  = '${req['body'].commission}', phone_no = '${req['body'].phoneNo}', country = '${req['body'].country}' where agent_code = '${req['body'].agentCode}'`);
            if (result.affectedRows > 0) {
                resp.status(200).json(result);
            } else {
                const insertResult = await pool.query(`insert into sample.agents values('${req['body'].agentCode}', '${req['body'].agentName}', '${req['body'].workingArea}', '${req['body'].commission}', '${req['body'].phoneNo}', '${req['body'].country}')`);
                if (insertResult.affectedRows > 0) {
                    resp.status(200).json(insertResult);
                } else {
                    resp.status(201).send("The agent is not located in the table - Operation  unsuccessful");
                }
            }
        } catch (err) {
            console.error('Error executing query', err.stack);
            resp.status(404).send('Error executing query' + err.stack);
        }
    });
    


app.listen(port, ()=>{
    console.log(`API server at ${port}`);
});
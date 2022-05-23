'use strict'

const Problem = require('../models').problems
const Submission = require('../models').submissions
const Sandbox = require('../grader/sandbox')
const _ = require('lodash')
const crypto = require ('crypto')
const path = require('path')
const socket = require('../services/socketsApi')

/**
 * Grader controller 
 */

function judge( submission_id, contest, fileNameExecution, filePathExecution) {
    getSubmissionData( submission_id, (res) =>{
        let data = res

        console.log(data)
        
        getProblemData( data, () => {
            //url de la ruta donde se almaceno el archivo desde /files
            var n = filePathExecution.indexOf('/files')
            let file_path = filePathExecution.substring(n, filePathExecution.length )
            //url de la ruta donde esta el input desde /files
            n = data.input.indexOf('/files')
            let input_path = data.input.substring(n, data.input.length )
            //url de la ruta donde esta el output desde /files
            n = data.output.indexOf('/files')
            let output_path = data.output.substring(n, data.output.length )
            
            //Directorio temporal de la ejecución
            let folder = crypto.randomBytes(24).toString('hex')
            let input_filename = path.basename( data.input )
            let output_filename = path.basename( data.output )

            let file_xml_name='', file_xml_path=''; //xml como formato para mostrar en blockly
            if(res.file_name.endsWith('xml')){
                file_xml_name = res.file_name
                n = res.file_path.indexOf('/files')
                file_xml_path = res.file_path.substring(n, res.file_path.length )
            }

            let execution = new Sandbox(
                file_path,
                fileNameExecution,
                folder,
                data.time_limit,
                input_path,
                output_path,
                data.language,
                input_filename,
                output_filename,
                file_xml_name,
                file_xml_path
            )

            execution.checkStatus( ( status ) => {
                
                if( status ){
                    console.log( "************** CONTENEDOR EJECUTANDOSE **********")
                    updateStatus( submission_id, { status: 'running'} )
                
                    execution.run( (verdict, executionTime) => {
                        let ans = {
                            status: 'executed',
                            execution_time: executionTime,
                            verdict: verdict
                        }
                        console.log("********** VEREDICTO ************")
                        console.log(ans)
                        
                        updateStatus( submission_id, ans )
                        //user, problem, verdict, sumission_id
                        if( contest ) socket.refreshScoreboard( data.user_id, data.problem_id, ans.verdict, submission_id, data.problem_title, data.created_at )
                        socket.notifySubmissionResult( data.user_id, data.problem_id, ans.verdict, data.problem_title )
                    })
                }
                console.log( "************** CONTENEDOR NO EN EJECUCION **********")
            })
        })
    })
}

function getSubmissionData( submission_id, cb ){
    Submission.findOne({
        where: { id: submission_id },
        attributes: ['problem_id', 'file_name', 'file_path', 'language', 'user_id', 'created_at']
    }).then( ( submission ) =>{
        let data = {
            problem_id: submission.problem_id,
            file_name: submission.file_name,
            file_path: submission.file_path,
            language: submission.language,
            user_id: submission.user_id,
            created_at: submission.created_at
        }
        cb( data )
    }).catch( (err) => {
        console.log( "Error trayendo el envio")
        console.log(err)
    } )
}

function getProblemData( data, cb ){
    Problem.findOne({
        where: { id: data.problem_id },
        attributes: ['input', 'output', 'time_limit', 'title_es', 'title_en']
    }).then( ( problem ) =>{
        data.input = problem.input
        data.output = problem.output
        data.time_limit = problem.time_limit
        if( problem.title_en )  data.problem_title = problem.title_en
        else data.problem_title = problem.title_es
        cb()
    }).catch( (err) => {
        console.log( "Error trayendo el problema")
        console.log(err)
    } )
}

function updateStatus( submission_id, data ){
    Submission.update(
        data,
        {
            where: { id: submission_id }
        }
    ).catch((err) => {
        console.log('Ocurrió un error actualizando el estado del envio')
    })
}

module.exports = {
    judge
}

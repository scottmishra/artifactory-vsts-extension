
const tl = require('azure-pipelines-task-lib/task');
const utils = require('artifactory-tasks-utils');

const cliPromoteCommand = "rt bpr";

function RunTaskCbk(cliPath) {
    let buildDefinition = tl.getVariable('Build.DefinitionName');
    let buildNumber = tl.getVariable('Build.BuildNumber');

    // Get input parameters
    let artifactoryService = tl.getInput("cvxArtifactoryService", false);
    let artifactoryUrl = tl.getEndpointUrl(artifactoryService, false);
    let targetRepo = tl.getInput("targetRepo", true);

    let cliCommand = utils.cliJoin(cliPath, cliPromoteCommand, utils.quote(buildDefinition), utils.quote(buildNumber), utils.quote(targetRepo), "--url=" + utils.quote(artifactoryUrl));

    cliCommand = utils.addArtifactoryCredentials(cliCommand, artifactoryService);
    cliCommand = utils.addStringParam(cliCommand, "status", "status");
    cliCommand = utils.addStringParam(cliCommand, "comment", "comment");
    cliCommand = utils.addStringParam(cliCommand, "sourceRepo", "source-repo");
    cliCommand = utils.addBoolParam(cliCommand, "includeDependencies", "include-dependencies");
    cliCommand = utils.addBoolParam(cliCommand, "copy", "copy");
    cliCommand = utils.addBoolParam(cliCommand, "dryRun", "dry-run");

    let taskRes = utils.executeCliCommand(cliCommand, process.cwd());
    if (taskRes) {
        tl.setResult(tl.TaskResult.Failed, taskRes);
    } else {
        tl.setResult(tl.TaskResult.Succeeded, "Build Succeeded.");
    }
}

utils.executeCliTask(RunTaskCbk);

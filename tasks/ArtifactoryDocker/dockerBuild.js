
const tl = require('azure-pipelines-task-lib/task');
const utils = require('artifactory-tasks-utils');

const dockerPushCommand = "rt dp";
const dockerPullCommand = "rt dpl";

function RunTaskCbk(cliPath) {
    // Validate docker exists on agent
    if (!utils.isToolExists("docker")) {
        tl.setResult(tl.TaskResult.Failed, "Agent is missing required tool: docker.");
        return;
    }

    let defaultWorkDir = tl.getVariable('System.DefaultWorkingDirectory');
    if (!defaultWorkDir) {
        tl.setResult(tl.TaskResult.Failed, "Failed getting default working directory.");
        return;
    }
    let buildDefinition = tl.getVariable('Build.DefinitionName');
    let buildNumber = tl.getVariable('Build.BuildNumber');

    // Get input parameters
    let artifactoryService = tl.getInput("cvxArtifactoryService", false);
    let artifactoryUrl = tl.getEndpointUrl(artifactoryService, false);
    let collectBuildInfo = tl.getBoolInput("collectBuildInfo");
    let imageName = tl.getInput("imageName", true);
    let dockerRepository;

    // Determine docker command
    let inputCommand = tl.getInput("command", true);
    let cliDockerCommand;
    if (inputCommand === "push") {
        cliDockerCommand = dockerPushCommand;
        dockerRepository = tl.getInput("targetRepo", true);
    } else if (inputCommand === "pull") {
        cliDockerCommand = dockerPullCommand;
        dockerRepository = tl.getInput("sourceRepo", true);
    } else {
        tl.setResult(tl.TaskResult.Failed, "Received invalid docker command: "+ inputCommand);
        return;
    }

    // Build the cli command
    let cliCommand = utils.cliJoin(cliPath, cliDockerCommand, utils.quote(imageName), utils.quote(dockerRepository), "--url=" + utils.quote(artifactoryUrl));
    cliCommand = utils.addArtifactoryCredentials(cliCommand, artifactoryService);

    // Add build info collection
    if (collectBuildInfo) {
        cliCommand = utils.cliJoin(cliCommand, "--build-name=" + utils.quote(buildDefinition), "--build-number=" + utils.quote(buildNumber));
    }

    let taskRes = utils.executeCliCommand(cliCommand, defaultWorkDir);

    if (taskRes) {
        tl.setResult(tl.TaskResult.Failed, taskRes);
    } else {
        tl.setResult(tl.TaskResult.Succeeded, "Build Succeeded.");
    }
}

utils.executeCliTask(RunTaskCbk);

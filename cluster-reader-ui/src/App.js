import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [namespaces, setNamespaces] = useState([]);
  const [clusterInfo, setClusterInfo] = useState([]);
  const [deploymentInfo, setDeploymentInfo] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/api/v1/namespaces')
      .then(function (response) {
        console.log(response.data);
        if (response.data.namespaces) {
          setNamespaces(response.data.namespaces);
        } else {
          console.error('Invalid API response: namespaces array not found');
        }
      })
      .catch(function (error) {
        console.error('Error fetching namespaces:', error);
      });

    axios.get('http://localhost:8080/api/v1/cluster-info')
      .then(function (response) {
        console.log(response.data);
        setClusterInfo(response.data.nodes);
      })
      .catch(function (error) {
        console.error('Error getting cluster info', error);
      });

    axios.get('http://localhost:8080/api/v1/namespaces/deployment-details')
      .then(function (response){
        console.log(response.data);
        setDeploymentInfo(response.data);
      })
      .catch(function (error) {
        console.error('Error getting deloyment info', error);
      });

  }, []); 

  const getClusterWorkerSums = (clusterInfo) => {
   
    let controlPlanePodTotal = 0;
    let controlPlaneCpuTotal = 0;
    let controlPlaneMemoryTotal = 0;

    let workerPodTotal = 0;
    let workerCpuTotal = 0;
    let workerMemoryTotal = 0;

    clusterInfo.map((info) => {
    
      if (!info.roles.includes("control-plane,master")){

        const intPodTotal = parseInt(info.allocatable.pods, 10);
        workerPodTotal += intPodTotal;

        const intCpuTotal = parseInt(info.allocatable.cpu, 10);
        workerCpuTotal += intCpuTotal;

        const intMemoryTotal = parseInt(info.allocatable.memory_ki, 10);
        workerMemoryTotal += intMemoryTotal;
      } else {
        const intPodTotal = parseInt(info.allocatable.pods, 10);
        controlPlanePodTotal += intPodTotal;

        const intCpuTotal = parseInt(info.allocatable.cpu, 10);
        controlPlaneCpuTotal += intCpuTotal;

        const intMemoryTotal = parseInt(info.allocatable.memory_ki, 10);
        controlPlaneMemoryTotal += intMemoryTotal;
      }
    })

    return (
      <div style={{display: 'flex'}}>
        <div style={{border: '2px solid green', marginBottom: '6px', padding: '13px', marginRight: '10px'}}>
          <h1>Control Plane Node Totals</h1>
          <h3>Pods: {controlPlanePodTotal}</h3>
          <h3>cpu: {controlPlaneCpuTotal}</h3>
          <h3>memory: {Math.round(controlPlaneMemoryTotal * 9.5367431640625e-7)} GB</h3>
        </div>
        <div style={{border: '2px solid green', marginBottom: '6px', padding: '13px'}}>
          <h1>Worker Node Totals</h1>
          <h3>Pods: {workerPodTotal}</h3>
          <h3>cpu: {workerCpuTotal}</h3>
          <h3>memory: {Math.round(workerMemoryTotal * 9.5367431640625e-7)} GB</h3>
        </div>
      </div>
    )
  }

  const processClusterInformation = (clusterInfo) => { 
    
      let fart = clusterInfo.map((info,index) => {
        return (
          <div style={{border: '2px solid green', marginBottom: '6px', padding: '13px', marginRight: '10px'}}>
            <h1 key={index}>{info.name}</h1>
            <div>
              <h6>
                Role(s): {info.roles}
              </h6>
              <h6>
                Created Date: {info.created_date}
              </h6>
              <h6>
                Pod Limit: {info.allocatable.pods}
              </h6>
              <h6>
                Available CPUs: {info.allocatable.cpu}
              </h6>
              <h6>
                Available Memory: {Math.round(info.allocatable.memory_ki * 9.5367431640625e-7)} GB
              </h6>
            </div>
          </div>
        );
      });

      return (
        <div style={{display: 'flex'}}>
          {fart}
        </div>
      )
  }

  const processNamespaces = (namespaces) => {
    
    let namespaceCount = 0;

    namespaces.map(() => {
      namespaceCount++;
    });


     let namespaceData = namespaces.map((namespace,index) => (
      <button key={index} className='Button'>{namespace}</button>
    ));

    return (
      <div>
        <h1>Namespace Information</h1>
        <h3>Total Namespaces: {namespaceCount}</h3>
      </div>
    );
  }

  const processDeploymentInfo = (deploymentInfo) => {
    let test = deploymentInfo.total_details.map((info) => {

      let namespace = info.namespace

      let deployments = info.deployment_details.map((deploymentInfo) => {
        
        console.log(deploymentInfo);
        let deploymentName = deploymentInfo.deployment_name;
        let replicaCount = deploymentInfo.replicas;
        let imageName = deploymentInfo.image;
        let cpuRequests = deploymentInfo.resources.requsts.cpu;
        let memoryRequests = deploymentInfo.resources.requsts.memory;
        let cpuLimit = deploymentInfo.resources.limits.cpu;
        let memoryLimit = deploymentInfo.resources.limits.memory;

        if (!cpuRequests.trim() || cpuRequests.includes("unable to regex out")) {
          cpuRequests = "undefined"
        }

        if (!memoryRequests.trim() || memoryRequests.includes("unable to regex out")) {
          memoryRequests = "undefined"
        }

        if (!cpuLimit.trim() || cpuLimit.includes("unable to regex out")) {
          cpuLimit = "undefined"
        }

        if (!memoryLimit.trim() || memoryLimit.includes("unable to regex out")) {
          memoryLimit = "undefined"
        }

        let some = (
          <div style={{border: '2px solid green', marginBottom: '6px', padding: '13px', marginRight: '10px'}}>
            <h6>
              Deployment Name: {deploymentName}
            </h6>
            <h6>
              Replica Count: {replicaCount}
            </h6>
            <h6>
              Image: {imageName}
            </h6>
            <h6>
              CPU Request: {cpuRequests}
            </h6>
            <h6>
              Memory Request: {memoryRequests}
            </h6>
            <h6>
              CPU Limit: {cpuLimit}
            </h6>
            <h6>
              Memory Limit: {memoryLimit}
            </h6>
          </div>
        )
        
        return some;
      });

      return(
        <div>
          <h3>
            Namespace: {namespace}
          </h3>
          <div style={{display: 'flex'}}>
            {deployments}
          </div>
          
        </div>
      );
    }); 

    return (
      <div>
        <h1>Deployment Information</h1>
        {test}
      </div>
    );
    
  }


  return (
    <div className="App">

      <div className='White-Text'>
        <h1>Cluster Information</h1>
        <div>
            <ul>
              {getClusterWorkerSums(clusterInfo)}
            </ul>
        </div>

        <div>
            <ul>
              {processClusterInformation(clusterInfo)}
            </ul>
        </div>
      </div>
    
      <div className='White-Text'>
        <div>
            <ul>
              {processNamespaces(namespaces)}
            </ul>
        </div>
      </div>


      <div className='White-Text'>
          <div>
            <ul>
              {processDeploymentInfo(deploymentInfo)}
            </ul>
          </div>
      </div>


      {/*
      <div className='White-Text'>
        {clusterInfo && (
          <div>
            <h1>Deployment Information: 21345</h1>
            <pre>{JSON.stringify(deploymentInfo, null, 2)}</pre>
          </div>
        )}
      </div>
      }


      {/*
      <div className='White-Text'>
        {clusterInfo && (
          <div>
            <h1>Cluster Information:</h1>
            <pre>{JSON.stringify(clusterInfo, null, 2)}</pre>
          </div>
        )}
      </div>
      */}

    </div>
  );
}

export default App;

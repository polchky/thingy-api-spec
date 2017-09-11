function defineSpecsFor(apiRoot){

  var macAddress = '0123456789ab';

    describe( "Getting configuration for a given Thingy", function() {
        it( "responds to a GET on setup with a correct configuration object", function() {
            return chai.request(apiRoot)
            .get('/' + macAddress + '/setup')
            .then(function(res) {
                expect(res).to.have.status(200);
                var setup = transformResponseToJson(res.text);

                expect(setup).to.have.property('color');
                expect(setup).to.have.deep.property('color.interval')
                    .that.is.an('number').that.is.at.least(0);
                expect(setup).to.have.property('temperature');
                expect(setup).to.have.deep.property('temperature.interval')
                    .that.is.an('number').that.is.at.least(0);
                expect(setup).to.have.property('pressure');
                expect(setup).to.have.deep.property('pressure.interval')
                    .that.is.an('number').that.is.at.least(0);
                expect(setup).to.have.property('gas');
                expect(setup).to.have.deep.property('gas.mode')
                    .that.is.an('number').that.is.at.least(0);
                expect(setup).to.have.property('humidity');
                expect(setup).to.have.deep.property('humidity.interval')
                    .that.is.an('number').that.is.at.least(0);
            });
        });
    });

    describe( "Pushing sensor data for a given Thingy", function() {
        function postSensorData(macAddress, data) {
            var date = new Date();
            return chai.request(apiRoot)
            .post('/' + macAddress + '/sensors/')
            .send({timestamp: date.toISOString(), sensors: data});
        }
        it( "pushes temperature data", function() {
            return postSensorData(macAddress, {temperature: 42})
            .then(function(res) {
                expect(res).to.have.status(200);
            });
        });
        it( "pushes pressure data", function() {
            return postSensorData(macAddress, {pressure: 42})
            .then(function(res) {
                expect(res).to.have.status(200);
            });
        });
        it( "pushes gas data", function() {
            return postSensorData(macAddress, {gas: 42})
            .then(function(res) {
                expect(res).to.have.status(200);
            });
        });
        it( "pushes humidity data", function() {
            return postSensorData(macAddress, {humidity: 42})
            .then(function(res) {
                expect(res).to.have.status(200);
            });
        });
        it( "pushes multiple sensor data", function() {
            return postSensorData(macAddress,
                {temperature: 42, pressure: 43, gas: 44, humidity: 45}
            )
            .then(function(res) {
                expect(res).to.have.status(200);
            });
        });
    });
    describe( "Pushing button state for a given Thingy", function() {
        function putButtonState(macAddress, state) {
            return chai.request(apiRoot)
            .put('/' + macAddress + '/sensors/button')
            .send({pressed: state});
        }
        it( "pushes button state (pressed)", function() {
            return putButtonState(macAddress, false)
            .then(function(res) {
                expect(res).to.have.status(200);
            });
        });
        it( "pushes button state (not pressed)", function() {
            return putButtonState(macAddress, true)
            .then(function(res) {
                expect(res).to.have.status(200);
            });
        });
    });
    describe(" Actuating LED", function() {
        function getLEDColor(macAddress, contentType) {
            return chai.request(apiRoot, contentType)
            .get('/' + macAddress + '/actuators/led')
            .set('Accepts', contentType);
        }
        it( "gets a LED value as JSON", function() {
            return getLEDColor(macAddress, 'application/json')
            .then(function(res) {
                data = transformResponseToJson(res.text);
                expect(data).to.have.property('color')
                    .that.is.a('number').that.is.at.least(0);
                expect(data).to.have.property('intensity')
                    .that.is.a('number').that.is.at.least(0);
                expect(data).to.have.property('delay')
                    .that.is.a('number').that.is.at.least(0);
            });
        });
        it( "gets an event-stream of LED values", function(done) {
            var evtSource = new EventSource(apiRoot + '/' + macAddress + '/actuators/led');
            var counter = 0;
            evtSource.onmessage = function(e) {
                try{
                    var data = transformResponseToJson(e.data);
                    expect(data).to.have.property('color')
                        .that.is.a('number').that.is.at.least(0);
                    expect(data).to.have.property('intensity')
                        .that.is.a('number').that.is.at.least(0);
                    expect(data).to.have.property('delay')
                        .that.is.a('number').that.is.at.least(0);
                    if(counter >= 2){
                        evtSource.close();
                        done();
                    }
                    counter += 1;
                    return;
                } catch(e) {
                    evtSource.close();
                    done(e);
                }
            }
            return;
        })

    });


  function transformResponseToJson(data){
    try{
      return JSON.parse(data);
    } catch(e) {
      var wrapped = new Error("Could not parse response as JSON.");
      wrapped.stack = e.stack;
      throw wrapped;
    }
  }
}

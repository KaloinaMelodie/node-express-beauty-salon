class ServiceSet {
  constructor(model) {
    this.Model = model;
  }

  // Create a new service
  async create(serviceData) {
    try {
      const newService = new this.Model(serviceData);
      const savedService = await newService.save();
      console.log('Service created:', savedService);
      return savedService;
    } catch (error) {
      console.error('Error creating service:', error.message);
      throw error;
    }
  }

  // Read all services    
  async getAll(offset = null, itemsPerPage = null, criteria = {}) {
    try {
      let query = this.Model.find(criteria);

      // If offset and itemsPerPage are provided, modify the query to include pagination
      if (offset !== null && itemsPerPage !== null) {
        query = query.skip(offset).limit(itemsPerPage);
      }

      const result = await query.exec();
      console.log('All :', result);
      return result;
    } catch (error) {
      console.error('Error fetching services:', error.message);
      throw error;
    }
  }

  // Update a service by ID
  async update(id, updatedData) {
    try {
      const updated = await this.Model.findByIdAndUpdate(id, updatedData, { new: true });
      console.log('Service updated:', updated);
      return updated;
    } catch (error) {
      console.error('Error updating service:', error.message);
      throw error;
    }
  }

  // Delete a service by ID
  async delete(id) {
    try {
      const deleted = await this.Model.findByIdAndDelete(id);
      console.log('Service deleted:', deleted);
      return deleted;
    } catch (error) {
      console.error('Error deleting service:', error.message);
      throw error;
    }
  }

  async search(criteria = {}) {
    try {
      const services = await this.Model.find(criteria);
      console.log('Matching services:', services);
      return services;
    } catch (error) {
      console.error('Error searching services:', error.message);
      throw error;
    }
  }

  async getOne(id){
    try {
      const result = await this.Model.findById(id);
      return result;
    } catch (error) {
      console.error('Error getting one:', error.message);
    }
  }
}

module.exports = ServiceSet;

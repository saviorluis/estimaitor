export default function EstimateForm({
  onSubmit,
  initialTab = 'commercial',
  mode = 'client'
}: EstimateFormProps) {
  // ... existing code ...

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Project Type</label>
        <select
          name="projectType"
          value={formData.projectType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="office">Office Building</option>
          <option value="retail">Retail Store</option>
          <option value="medical">Medical Facility</option>
          <option value="educational">School/Educational</option>
          <option value="industrial">Industrial/Warehouse</option>
          <option value="restaurant">Restaurant</option>
          <option value="hotel">Hotel/Hospitality</option>
          <option value="jewelry_store">Jewelry Store</option>
          <option value="apartment">Apartment Complex</option>
          <option value="warehouse">Warehouse</option>
          <option value="dormitory">Dormitory</option>
          <option value="grocery_store">Grocery Store</option>
          <option value="yoga_studio">Yoga Studio</option>
          <option value="kids_fitness">Kids Fitness Center</option>
          <option value="fast_food">Fast Food Restaurant</option>
          <option value="bakery">Bakery</option>
          <option value="coffee_shop">Coffee Shop</option>
          <option value="dental_office">Dental Office</option>
          <option value="pet_resort">Pet Resort</option>
          <option value="beauty_store">Beauty Store</option>
          <option value="interactive_toy_store">Interactive Toy Store</option>
          <option value="mailroom">Mailroom</option>
          <option value="church">Church/Religious Facility</option>
          <option value="residential">Residential</option>
          <option value="car_wash">Car Wash</option>
          <option value="construction_trailor">Construction Trailer</option>
          <option value="shell_building">Shell Building</option>
        </select>
      </div>

      // ... rest of the form ...
    </form>
  );
} 
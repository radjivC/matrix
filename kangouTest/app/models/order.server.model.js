'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
	tokenToCharge : {
		cardId : String,
		provider : String
	},
	status: {
		type: String,
		//enum: Object.keys(orderStates).map(function(k) { return orderStates[k]; }),
	},
	date: {
		type: String,
	},
	distancePickUpToDropOff: String,
	aproximateDistanceToFirstPoint: String,
	price: {
		amount: Number,
		currency: String
	},
	items: {
		type: String,
		required: 'Favor de indicar los productos a recoger o entregar'
	},
	pushDeviceToken: String,
	isAPurchase: String,
	pickup: {
		lat: Number,
		lng: Number,
		street: String,
		sublocality: String,
		locality: String,
		administrativeArea: String,
		country: String,
		postalCode: String,
		isoCountry: String,
		references: String,
		fullname: String
	},
	dropoff: {
		lat: Number,
		lng: Number,
		street: String,
		sublocality: String,
		locality: String,
		administrativeArea: String,
		country: String,
		postalCode: String,
		isoCountry: String,
		references: String,
		fullname: String
	},
	customer: { type: Schema.Types.ObjectId, ref: 'User', required: 'Favor de indicar un usuario' },
	courier: { type: Schema.Types.ObjectId, ref: 'User'},
	customerSignature: {
		platform: String,
		signaturePoints: [Schema.Types.Mixed]
	},
	reviewFromCourier: {
		comments: String,
		rating: Number
	},
	reviewFromCustomer: {
		comments: String,
		rating: Number
	},
	created: {
		type: Date,
		default: Date.now
	},
	updatedStatus: Schema.Types.Mixed
});


mongoose.model('Order', OrderSchema);

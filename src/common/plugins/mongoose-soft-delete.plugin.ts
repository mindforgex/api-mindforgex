import mongoose, {
  Document,
  MongooseDefaultQueryMiddleware,
  Schema,
} from 'mongoose';

const DELETED_FALSE = 1;

export type SoftDeleteDocument = {
  deletedAt: number; // DELETE_FALSE or Date.now()
} & Document;

export const mongooseSoftDeletePlugin = (schema: Schema) => {
  schema.add({
    deletedAt: { type: Number, required: true, default: DELETED_FALSE },
  });

  const typesFindQueryMiddleware: MongooseDefaultQueryMiddleware[] = [
    'count',
    'countDocuments',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndUpdate',
    'updateOne',
    'updateMany',
  ];

  typesFindQueryMiddleware.forEach((type) => {
    schema.pre(type, function (next) {
      this.where({ deletedAt: DELETED_FALSE });
      next();
    });
  });

  schema.statics.findByIdAndDelete = function (id: mongoose.ObjectId) {
    return this.findByIdAndUpdate(id, { deletedAt: Date.now() }, { new: true });
  };

  schema.pre('aggregate', function (this: mongoose.Aggregate<any>, next: any) {
    this.pipeline().unshift({ $match: { deletedAt: DELETED_FALSE } });
    next();
  });
};

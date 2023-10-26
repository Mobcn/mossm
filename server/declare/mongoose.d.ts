declare namespace mongoose {
    type FilterQuery<T> = { [key in T & string]?: any } & { [x: string]: any };

    type SortOrder = 1 | -1 | 'asc' | 'ascending' | 'desc' | 'descending';

    type Require_id<T> = T & { _id: string };

    class Query<ResultType, DocType> {
        /** Executes the query */
        exec(): Promise<ResultType>;

        /** Specifies arguments for an `$and` condition. */
        and(array: FilterQuery<DocType>[]): this;

        /** Specifies a `$gt` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        gt<K = string>(path: K, val: any): this;
        gt(val: number): this;

        /** Specifies a `$gte` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        gte<K = string>(path: K, val: any): this;
        gte(val: number): this;

        /** Specifies an `$in` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        in<K = string>(path: K, val: any[]): this;
        in(val: Array<any>): this;

        /** Specifies the maximum number of documents the query will return. */
        limit(val: number): this;

        /** Specifies a `$lt` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        lt<K = string>(path: K, val: any): this;
        lt(val: number): this;

        /** Specifies a `$lte` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        lte<K = string>(path: K, val: any): this;
        lte(val: number): this;

        /** Specifies a `$mod` condition, filters documents for documents whose `path` property is a number that is equal to `remainder` modulo `divisor`. */
        mod<K = string>(path: K, val: number): this;
        mod(val: Array<number>): this;

        /** Specifies a `$ne` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        ne<K = string>(path: K, val: any): this;
        ne(val: any): this;

        /** Specifies an `$nin` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        nin<K = string>(path: K, val: any[]): this;
        nin(val: Array<any>): this;

        /** Specifies arguments for an `$nor` condition. */
        nor(array: Array<FilterQuery<DocType>>): this;

        /** Specifies arguments for an `$or` condition. */
        or(array: Array<FilterQuery<DocType>>): this;

        /** Specifies a `$regex` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        regex<K = string>(path: K, val: RegExp): this;
        regex(val: string | RegExp): this;

        /** Specifies which document fields to include or exclude (also known as the query "projection") */
        select(arg: string | string[] | Record<string, number | boolean | object>): this;

        /** Specifies an `$size` query condition. When called with one argument, the most recent path passed to `where()` is used. */
        size<K = string>(path: K, val: number): this;
        size(val: number): this;

        /** Specifies the number of documents to skip. */
        skip(val: number): this;

        /** Specifies a `$slice` projection for an array. */
        slice(path: string, val: number | Array<number>): this;
        slice(val: number | Array<number>): this;

        /** Sets the sort order. If an object is passed, values allowed are `asc`, `desc`, `ascending`, `descending`, `1`, and `-1`. */
        sort(
            arg?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null
        ): this;

        /** Specifies a path for use with chaining. */
        where(path: string, val?: any): this;
        where(obj: object): this;
        where(): this;

        /**
         * Sets the [maxTimeMS](https://www.mongodb.com/docs/manual/reference/method/cursor.maxTimeMS/)
         * option. This will tell the MongoDB server to abort if the query or write op
         * has been running for more than `ms` milliseconds.
         */
        maxTimeMS(ms: number): this;

        /**
         * Executes the query returning a `Promise` which will be
         * resolved with either the doc(s) or rejected with the error.
         * Like `.then()`, but only takes a rejection handler.
         */
        catch: Promise<ResultType>['catch'];

        /**
         * Executes the query returning a `Promise` which will be
         * resolved with `.finally()` chained.
         */
        finally: Promise<ResultType>['finally'];

        /**
         * Executes the query returning a `Promise` which will be
         * resolved with either the doc(s) or rejected with the error.
         */
        then: Promise<ResultType>['then'];
    }

    class Document<T = any, DocType = any> {
        /** This documents _id. */
        _id?: T;

        /** This documents __v. */
        __v?: any;

        /** The string version of this documents _id. */
        id?: any;

        /** Removes this document from the db. */
        deleteOne(): Promise<this>;

        /**
         * Returns true if this document is equal to another document.
         *
         * Documents are considered equal when they have matching `_id`s, unless neither
         * document has an `_id`, in which case this function falls back to using
         * `deepEqual()`.
         */
        equals(doc: Document<T>): boolean;

        /** Sends a replaceOne command with this document `_id` as the query selector. */
        replaceOne(replacement?: any): Query<any, this>;

        /** Saves this document by inserting a new document into the database if [document.isNew](/docs/api/document.html#document_Document-isNew) is `true`, or sends an [updateOne](/docs/api/document.html#document_Document-updateOne) operation with just the modified paths if `isNew` is `false`. */
        save(): Promise<this>;

        /** Sets the value of a path, or many paths. */
        set<T extends keyof DocType>(path: T, val: DocType[T], type: any): this;
        set(path: string | Record<string, any>, val: any, type: any): this;
        set(path: string | Record<string, any>, val: any): this;
        set(value: string | Record<string, any>): this;

        /** The return value of this method is used in calls to JSON.stringify(doc). */
        toJSON<T = Require_id<DocType>>(): T;

        /** Converts this document into a plain-old JavaScript object ([POJO](https://masteringjs.io/tutorials/fundamentals/pojo)). */
        toObject<T = Require_id<DocType>>(): Require_id<T>;

        /** Sends an updateOne command with this document `_id` as the query selector. */
        updateOne(update?: FilterQuery<DocType>): Query<any, this>;
    }

    type HydratedDocument<DocType> = Document<string, DocType> & DocType;

    interface Model<TRawDocType, THydratedDocumentType = HydratedDocument<TRawDocType>> {
        new <DocType = TRawDocType>(doc?: DocType, fields?: any | null, options?: boolean | any): THydratedDocumentType;

        /** Creates a `count` query: counts the number of documents that match `filter`. */
        count(filter?: FilterQuery<TRawDocType>): Promise<number>;

        /**
         * Deletes all of the documents that match `conditions` from the collection.
         * Behaves like `remove()`, but deletes all documents that match `conditions`
         * regardless of the `single` option.
         */
        deleteMany(filter: FilterQuery<TRawDocType>): Promise<any>;

        /**
         * Deletes the first document that matches `conditions` from the collection.
         * Behaves like `remove()`, but deletes at most one document regardless of the
         * `single` option.
         */
        deleteOne(filter: FilterQuery<TRawDocType>): Promise<any>;

        /**
         * Finds a single document by its _id field. `findById(id)` is almost*
         * equivalent to `findOne({ _id: id })`. If you want to query by a document's
         * `_id`, use `findById()` instead of `findOne()`.
         */
        findById<ResultDoc = THydratedDocumentType>(id: any): Promise<ResultDoc | null>;

        /** Finds one document. */
        findOne<ResultDoc = THydratedDocumentType>(filter?: FilterQuery<TRawDocType>): Promise<ResultDoc | null>;

        /** Inserts one or more new documents as a single `insertMany` call to the MongoDB server. */
        insertMany(docs: Array<TRawDocType>): Promise<Array<THydratedDocumentType>>;

        /**
         * Returns a document with its `_id` if at least one document exists in the database that matches
         * the given `filter`, and `null` otherwise.
         */
        exists(filter: FilterQuery<TRawDocType>): Promise<{ _id: any } | null>;

        /** Creates a `find` query: gets a list of documents that match `filter`. */
        find<ResultDoc = THydratedDocumentType>(filter: FilterQuery<TRawDocType>): Query<Array<ResultDoc>, TRawDocType>;
        find<ResultDoc = THydratedDocumentType>(): Query<Array<ResultDoc>, TRawDocType>;

        /** Creates a `findByIdAndDelete` query, filtering by the given `_id`. */
        findByIdAndDelete(id: any): Promise<any>;

        /** Creates a `findByIdAndRemove` query, filtering by the given `_id`. */
        findByIdAndRemove(id: any): Promise<any>;

        /** Creates a `findOneAndUpdate` query, filtering by the given `_id`. */
        findByIdAndUpdate(id: any, update: FilterQuery<TRawDocType>): Promise<any>;

        /** Creates a `findOneAndDelete` query: atomically finds the given document, deletes it, and returns the document as it was before deletion. */
        findOneAndDelete(filter: FilterQuery<TRawDocType>): Promise<any>;

        /** Creates a `findOneAndRemove` query: atomically finds the given document and deletes it. */
        findOneAndRemove(filter?: FilterQuery<TRawDocType>): Promise<any>;

        /** Creates a `findOneAndReplace` query: atomically finds the given document and replaces it with `replacement`. */
        findOneAndReplace(filter: FilterQuery<TRawDocType>, replacement: TRawDocType): Promise<any>;

        /** Creates a `findOneAndUpdate` query: atomically find the first document that matches `filter` and apply `update`. */
        findOneAndUpdate(filter: FilterQuery<TRawDocType>, update: FilterQuery<TRawDocType>): Promise<any>;

        /** Creates a `updateMany` query: updates all documents that match `filter` with `update`. */
        updateMany(filter?: FilterQuery<TRawDocType>, update?: FilterQuery<TRawDocType>): Promise<any>;

        /** Creates a `updateOne` query: updates the first document that matches `filter` with `update`. */
        updateOne(filter?: FilterQuery<TRawDocType>, update?: FilterQuery<TRawDocType>): Promise<any>;

        /** Schema the model uses. */
        schema: { obj: { [key in TRawDocType & string]: any } };
    }
}

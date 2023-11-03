namespace $$namespace$$ {
    import mongoose from 'mongoose';
    $$types$$;
    $$names$$;
    $$results$$;
}

declare const Model: $$namespace$$.$$currentModelName$$Model;
declare const importModel: <T extends $$namespace$$.ModelName>(
    model: T,
    callback?: (Model: $$namespace$$.ResultModel<T>) => void
) => Promise<$$namespace$$.ResultModel<T>>;

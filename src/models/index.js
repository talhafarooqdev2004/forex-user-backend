import { sequelize, User } from '../config/database.js';
import _sequelize from 'sequelize';
import SubscriptionPackage from './SubscriptionPackage.js';
import SubscriptionPackageTranslation from './SubscriptionPackageTranslation.js';
import ForumTopic from './ForumTopic.js';
import ForumTopicTranslation from './ForumTopicTranslation.js';
import ForumPost from './ForumPost.js';
import ForumPostTranslation from './ForumPostTranslation.js';
import ForumComment from './ForumComment.js';
import Education from './Education.js';
import EducationTranslation from './EducationTranslation.js';
import PageContent from './PageContent.js';
import PageContentTranslation from './PageContentTranslation.js';
import PaymentGateway from './PaymentGateway.js';
import PaymentTransaction from './PaymentTransaction.js';
import UserSubscription from './UserSubscription.js';

const { DataTypes } = _sequelize;

// init models
SubscriptionPackage.init(sequelize, DataTypes);
SubscriptionPackageTranslation.init(sequelize, DataTypes);

ForumTopic.init(sequelize, DataTypes);
ForumTopicTranslation.init(sequelize, DataTypes);

ForumPost.init(sequelize, DataTypes);
ForumPostTranslation.init(sequelize, DataTypes);
ForumComment.init(sequelize, DataTypes);

Education.init(sequelize, DataTypes);
EducationTranslation.init(sequelize, DataTypes);

PageContent.init(sequelize, DataTypes);
PageContentTranslation.init(sequelize, DataTypes);

PaymentGateway.init(sequelize, DataTypes);
PaymentTransaction.init(sequelize, DataTypes);
UserSubscription.init(sequelize, DataTypes);

const models = {
    SubscriptionPackage,
    SubscriptionPackageTranslation,
    ForumTopic,
    ForumTopicTranslation,
    ForumPost,
    ForumPostTranslation,
    ForumComment,
    User,
    Education,
    EducationTranslation,
    PageContent,
    PageContentTranslation,
    PaymentGateway,
    PaymentTransaction,
    UserSubscription,
};

// set associations
Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

export default models;

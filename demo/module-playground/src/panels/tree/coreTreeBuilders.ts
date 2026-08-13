import { ReactorTreeLeaf, ReactorTreeNode, SearchableTreeSearchScope } from '@journeyapps/reactor-mod';

type CoreTreeVariant = {
  key: string;
  title: string;
  subtitle: string;
  tree: ReactorTreeNode;
  searchScope: SearchableTreeSearchScope;
};

const createLeaf = (key: string, label: string = key, icon: string = 'circle', iconColor: string = 'currentColor') => {
  return new ReactorTreeLeaf({
    key,
    getTreeProps: () => ({
      label,
      icon: icon as any,
      iconColor
    }),
    match: (event) => event.matches(label)
  });
};

const createNode = (
  key: string,
  label: string = key,
  children: Array<ReactorTreeNode | ReactorTreeLeaf> = [],
  icon: string = 'folder',
  iconColor: string = 'currentColor'
) => {
  const node = new ReactorTreeNode({
    key,
    getTreeProps: () => ({
      label,
      icon: icon as any,
      iconColor
    }),
    match: (event) => event.matches(label)
  });
  children.forEach((child) => {
    node.addChild(child);
  });
  return node;
};

const buildStaticCoreTree = (prefix: string) => {
  const drinks = createNode(
    `${prefix}-drinks`,
    'Drinks',
    [
      createLeaf(`${prefix}-coffee`, 'Coffee beans', 'mug-hot'),
      createLeaf(`${prefix}-tea`, 'Tea leaves', 'leaf', '#5a8f4f'),
      createLeaf(`${prefix}-water`, 'Sparkling water', 'tint', '#3b82f6')
    ],
    'glass-water',
    '#0ea5a4'
  );

  const groceries = createNode(
    `${prefix}-groceries`,
    'Groceries',
    [
      createLeaf(`${prefix}-eggs`, 'Eggs', 'egg', '#b08968'),
      createLeaf(`${prefix}-bread`, 'Bread', 'bread-slice', '#b45309'),
      createLeaf(`${prefix}-butter`, 'Butter', 'cube', '#ca8a04')
    ],
    'shopping-basket',
    '#6b7280'
  );

  const root = createNode(`${prefix}-root`, 'Shopping list', [drinks, groceries], 'list-check', '#2563eb');
  root.open({ reveal: false });
  return root;
};

const buildLazyCoreTree = (prefix: string) => {
  const installLazyChildren = (
    node: ReactorTreeNode,
    childrenFactory: () => Array<ReactorTreeNode | ReactorTreeLeaf>
  ) => {
    node.registerListener({
      collapsedChanged: () => {
        if (!node.collapsed && node.children.length === 0) {
          childrenFactory().forEach((child) => {
            node.addChild(child);
          });
          return;
        }
        if (node.collapsed && node.children.length > 0) {
          [...node.children].forEach((child) => {
            child.delete();
          });
        }
      }
    });
  };

  const drinks = createNode(`${prefix}-drinks`, 'Drinks', [], 'glass-water', '#0ea5a4');
  installLazyChildren(drinks, () => {
    return [
      createLeaf(`${prefix}-coffee`, 'Coffee beans', 'mug-hot'),
      createLeaf(`${prefix}-tea`, 'Tea leaves', 'leaf', '#5a8f4f'),
      createLeaf(`${prefix}-water`, 'Sparkling water', 'tint', '#3b82f6')
    ];
  });

  const groceries = createNode(`${prefix}-groceries`, 'Groceries', [], 'shopping-basket', '#6b7280');
  installLazyChildren(groceries, () => {
    return [
      createLeaf(`${prefix}-eggs`, 'Eggs', 'egg', '#b08968'),
      createLeaf(`${prefix}-bread`, 'Bread', 'bread-slice', '#b45309'),
      createLeaf(`${prefix}-butter`, 'Butter', 'cube', '#ca8a04')
    ];
  });

  const root = createNode(`${prefix}-root`, 'Shopping list', [drinks, groceries], 'list-check', '#2563eb');
  root.open({ reveal: false });
  return root;
};

export const buildCoreTreeVariants = (): CoreTreeVariant[] => {
  return [
    {
      key: 'core-full-tree',
      title: 'Core Tree (Full Tree Search)',
      subtitle: 'SearchableCoreTreeWidget with searchScope = FULL_TREE',
      tree: buildStaticCoreTree('core-full'),
      searchScope: SearchableTreeSearchScope.FULL_TREE
    },
    {
      key: 'core-lazy-tree',
      title: 'Core Tree (Lazy Child Loading)',
      subtitle: 'Children are generated when the node opens',
      tree: buildLazyCoreTree('core-lazy'),
      searchScope: SearchableTreeSearchScope.FULL_TREE
    },
    {
      key: 'core-visible-tree',
      title: 'Core Tree (Visible-Only Search)',
      subtitle: 'SearchableCoreTreeWidget with searchScope = VISIBLE_ONLY',
      tree: buildStaticCoreTree('core-visible'),
      searchScope: SearchableTreeSearchScope.VISIBLE_ONLY
    }
  ];
};

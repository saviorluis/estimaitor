import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';
import { lineItemCaption, type ProposalFact, type QuoteLineItem } from '@/lib/proposals';

type StyleProp = React.ComponentProps<typeof View>['style'];
type Style = Exclude<NonNullable<StyleProp>, unknown[]>;

const flatten = (...styles: StyleProp[]): Style[] =>
  styles.flatMap((style) => (style === undefined ? [] : Array.isArray(style) ? (style as Style[]) : [style as Style]));

export function ProposalFactLines({ facts, textStyle }: { facts: ProposalFact[]; textStyle?: StyleProp }) {
  return (
    <>
      {facts.map((fact) => (
        <Text key={fact.label} style={flatten(textStyle)}>
          {fact.label}: {fact.value}
        </Text>
      ))}
    </>
  );
}

export function ProposalTextSection({
  title,
  lines,
  sectionStyle,
  titleStyle,
  lineStyle,
}: {
  title: string;
  lines: string[];
  sectionStyle?: StyleProp;
  titleStyle?: StyleProp;
  lineStyle?: StyleProp;
}) {
  if (lines.length === 0) return null;
  return (
    <View style={flatten(sectionStyle)} wrap={false}>
      <Text style={flatten(titleStyle)}>{title}</Text>
      {lines.map((line, i) => (
        <Text key={i} style={flatten(lineStyle)}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

export function ProposalLineItemRows({
  items,
  rowStyle,
  descriptionCellStyle,
  amountCellStyle,
  titleStyle,
  captionStyle,
  amountStyle,
  unpricedLabel = 'Included',
}: {
  items: QuoteLineItem[];
  rowStyle?: StyleProp;
  descriptionCellStyle?: StyleProp;
  amountCellStyle?: StyleProp;
  titleStyle?: StyleProp;
  captionStyle?: StyleProp;
  amountStyle?: StyleProp;
  /** Shown in the amount column of quantity-only lines. */
  unpricedLabel?: string;
}) {
  return (
    <>
      {items.map((item) => {
        const caption = lineItemCaption(item);
        return (
          <View key={item.id} style={flatten(rowStyle)} wrap={false}>
            <View style={flatten(descriptionCellStyle)}>
              <Text style={flatten(titleStyle)}>{item.description}</Text>
              {caption ? <Text style={flatten(captionStyle)}>{caption}</Text> : null}
            </View>
            <View style={flatten(amountCellStyle)}>
              <Text style={flatten(amountStyle)}>{item.amount === null ? unpricedLabel : formatCurrency(item.amount)}</Text>
            </View>
          </View>
        );
      })}
    </>
  );
}
